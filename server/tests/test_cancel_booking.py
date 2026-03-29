from datetime import date, timedelta

from tests.utils import auth_header, login, register_user


def _future_booking_setup(client):
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post(
        "/api/stores",
        json={"storeName": "Rentals"},
        headers=auth_header(owner_token),
    )
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()["items"][
        0
    ]["id"]
    pid = client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "Item",
            "pricePerDay": 10.0,
            "depositAmount": 5.0,
            "totalQuantity": 5,
        },
        headers=auth_header(owner_token),
    ).json()["id"]

    cust_email = register_user(client, role="customer")
    cust_token = login(client, cust_email)
    start = date.today() + timedelta(days=30)
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
    assert br.status_code == 200
    booking_id = br.json()["id"]
    return cust_token, owner_token, booking_id


def test_customer_cancels_own_future_booking(client):
    cust_token, _, booking_id = _future_booking_setup(client)
    r = client.patch(
        f"/api/bookings/{booking_id}/cancel",
        headers=auth_header(cust_token),
    )
    assert r.status_code == 200
    assert r.json()["status"] == "cancelled"


def test_cancel_twice_returns_400(client):
    cust_token, _, booking_id = _future_booking_setup(client)
    client.patch(
        f"/api/bookings/{booking_id}/cancel",
        headers=auth_header(cust_token),
    )
    r = client.patch(
        f"/api/bookings/{booking_id}/cancel",
        headers=auth_header(cust_token),
    )
    assert r.status_code == 400


def test_cannot_cancel_another_users_booking(client):
    cust_token, _, booking_id = _future_booking_setup(client)
    other_email = register_user(client, role="customer")
    other_token = login(client, other_email)
    r = client.patch(
        f"/api/bookings/{booking_id}/cancel",
        headers=auth_header(other_token),
    )
    assert r.status_code == 403


def test_cancel_unknown_booking_404(client):
    cust_token = login(client, register_user(client, role="customer"))
    r = client.patch(
        "/api/bookings/999999/cancel",
        headers=auth_header(cust_token),
    )
    assert r.status_code == 404
