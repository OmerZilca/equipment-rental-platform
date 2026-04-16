from datetime import date, datetime, timedelta

import app.services.bookings_service as bookings_service
from app.db.database import SessionLocal
from app.db.models import Booking
from tests.utils import auth_header, login, register_user


def test_only_customer_can_create_booking(client):
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "S"},
        headers=auth_header(owner_token),
    )
    # reuse product from store - need product id
    stores = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()
    sid = stores["items"][0]["id"]
    pr = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "X",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 10,
        },
        headers=auth_header(owner_token),
    )
    pid = pr.json()["id"]

    start = date.today() + timedelta(days=14)
    end = start + timedelta(days=1)
    r = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(owner_token),
    )
    assert r.status_code == 403


def test_early_return_allows_new_booking_inside_original_end_window(client):
    """Stock is freed from the actual return date, not the scheduled end_date."""
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Early return"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Single unit",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 1,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date.today()
    end = start + timedelta(days=14)
    bid = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    ).json()["id"]
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    ).status_code == 200
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "returned"},
        headers=auth_header(owner_token),
    ).status_code == 200

    overlap_start = start + timedelta(days=3)
    overlap_end = start + timedelta(days=7)
    chk = client.get(
        "/api/bookings/check-availability",
        params={
            "equipment_id": pid,
            "start_date": overlap_start.isoformat(),
            "end_date": overlap_end.isoformat(),
            "quantity": 1,
        },
    )
    assert chk.status_code == 200, chk.text
    assert chk.json()["available"] is True

    br2 = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": overlap_start.isoformat(),
            "endDate": overlap_end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br2.status_code == 200, br2.text


def test_customer_booking_and_my_bookings(client):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "S"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Lens",
            "pricePerDay": 5.0,
            "depositAmount": 5.0,
            "totalQuantity": 2,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date.today() + timedelta(days=20)
    end = start + timedelta(days=2)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text

    mine = client.get("/api/bookings/me", headers=auth_header(cust_token))
    assert mine.status_code == 200
    assert mine.json()["total"] >= 1


def test_owner_cannot_confirm_pickup_before_start_date(client):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Pickup gate"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Kit",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date.today() + timedelta(days=25)
    end = start + timedelta(days=1)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text
    bid = br.json()["id"]

    r = client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    )
    assert r.status_code == 400
    assert "start date" in r.json()["detail"].lower()


def test_owner_can_confirm_pickup_on_start_date(client):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Pickup ok"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Box",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date.today()
    end = start + timedelta(days=2)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text
    bid = br.json()["id"]

    r = client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    )
    assert r.status_code == 200, r.text
    assert r.json()["fulfillmentStatus"] == "picked_up"


def test_pending_auto_not_picked_up_after_rental_ends(client, monkeypatch):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Auto close"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Unit",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date(2029, 2, 1)
    end = date(2029, 2, 5)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text
    bid = br.json()["id"]

    monkeypatch.setattr(
        bookings_service, "_calendar_today", lambda: date(2030, 1, 1)
    )
    lst = client.get(
        "/api/bookings/store/mine",
        headers=auth_header(owner_token),
    )
    assert lst.status_code == 200
    rows = [x for x in lst.json()["items"] if x["id"] == bid]
    assert len(rows) == 1
    assert rows[0]["fulfillmentStatus"] == "not_picked_up"

    r = client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    )
    assert r.status_code == 400


def test_owner_damage_report_after_return_only(client):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Damage test"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Fragile",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    start = date.today()
    end = start + timedelta(days=2)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text
    bid = br.json()["id"]
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    ).status_code == 200
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "returned"},
        headers=auth_header(owner_token),
    ).status_code == 200

    dr = client.patch(
        f"/api/bookings/{bid}/damage-report",
        json={"description": "Lens scratch on front element."},
        headers=auth_header(owner_token),
    )
    assert dr.status_code == 200, dr.text
    data = dr.json()
    assert data["damageNotes"] == "Lens scratch on front element."
    assert data["damageReportedAt"] is not None
    assert data["damageReportAllowed"] is True

    clr = client.delete(
        f"/api/bookings/{bid}/damage-report",
        headers=auth_header(owner_token),
    )
    assert clr.status_code == 200, clr.text
    assert clr.json()["damageNotes"] is None
    assert clr.json()["damageReportedAt"] is None


def test_damage_report_rejected_more_than_24h_after_return(client):
    cust_token = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Damage window"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "X",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]
    start = date.today()
    end = start + timedelta(days=1)
    bid = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    ).json()["id"]
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    ).status_code == 200
    assert client.patch(
        f"/api/bookings/{bid}/fulfillment",
        json={"fulfillmentStatus": "returned"},
        headers=auth_header(owner_token),
    ).status_code == 200

    db = SessionLocal()
    try:
        row = db.query(Booking).filter(Booking.id == bid).first()
        row.returned_at = datetime.utcnow() - timedelta(hours=30)
        db.commit()
    finally:
        db.close()

    dr = client.patch(
        f"/api/bookings/{bid}/damage-report",
        json={"description": "Too late."},
        headers=auth_header(owner_token),
    )
    assert dr.status_code == 400


def test_damage_report_blocked_after_next_pickup_same_product(client, monkeypatch):
    cust_a = login(client, register_user(client, role="customer"))
    cust_b = login(client, register_user(client, role="customer"))
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Chain"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()[
        "items"
    ][0]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Shared",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    a_start = date.today()
    a_end = date.today() + timedelta(days=1)
    bid_a = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": a_start.isoformat(),
            "endDate": a_end.isoformat(),
        },
        headers=auth_header(cust_a),
    ).json()["id"]
    assert client.patch(
        f"/api/bookings/{bid_a}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    ).status_code == 200
    assert client.patch(
        f"/api/bookings/{bid_a}/fulfillment",
        json={"fulfillmentStatus": "returned"},
        headers=auth_header(owner_token),
    ).status_code == 200

    b_start = date.today() + timedelta(days=2)
    b_end = date.today() + timedelta(days=6)
    bid_b = client.post(
        "/api/bookings",
        json={
            "equipmentId": pid,
            "quantity": 1,
            "startDate": b_start.isoformat(),
            "endDate": b_end.isoformat(),
        },
        headers=auth_header(cust_b),
    ).json()["id"]
    monkeypatch.setattr(bookings_service, "_calendar_today", lambda: b_start)
    assert client.patch(
        f"/api/bookings/{bid_b}/fulfillment",
        json={"fulfillmentStatus": "picked_up"},
        headers=auth_header(owner_token),
    ).status_code == 200

    dr = client.patch(
        f"/api/bookings/{bid_a}/damage-report",
        json={"description": "Should not be allowed."},
        headers=auth_header(owner_token),
    )
    assert dr.status_code == 400
