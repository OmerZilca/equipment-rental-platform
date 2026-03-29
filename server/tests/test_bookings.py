from datetime import date, timedelta

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
