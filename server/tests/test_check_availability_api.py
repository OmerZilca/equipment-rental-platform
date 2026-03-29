from datetime import date, timedelta

from tests.utils import auth_header, login, register_user


def _product_id(client):
    owner_email = register_user(client, role="business_owner")
    owner_token = login(client, owner_email)
    client.post("/api/stores", json={"storeName": "A"}, headers=auth_header(owner_token))
    sid = client.get("/api/stores/mine", headers=auth_header(owner_token)).json()["items"][
        0
    ]["id"]
    return client.post(
        "/api/products",
        json={
            "storeId": sid,
            "productName": "P",
            "pricePerDay": 2.0,
            "depositAmount": 1.0,
            "totalQuantity": 10,
        },
        headers=auth_header(owner_token),
    ).json()["id"]


def test_check_availability_ok_for_future_dates(client):
    pid = _product_id(client)
    start = date.today() + timedelta(days=40)
    end = start + timedelta(days=1)
    r = client.get(
        "/api/bookings/check-availability",
        params={
            "equipment_id": pid,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "quantity": 1,
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["equipmentId"] == pid
    assert body["available"] is True
    assert body["availableQuantity"] >= 1


def test_check_availability_past_start_rejected(client):
    pid = _product_id(client)
    start = date.today() - timedelta(days=1)
    end = date.today() + timedelta(days=1)
    r = client.get(
        "/api/bookings/check-availability",
        params={
            "equipment_id": pid,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "quantity": 1,
        },
    )
    assert r.status_code == 400
