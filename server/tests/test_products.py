from datetime import date, timedelta

from tests.utils import auth_header, login, register_user


def _owner_with_store_and_product(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    sr = client.post(
        "/api/stores",
        json={"storeName": "Shop"},
        headers=auth_header(token),
    )
    assert sr.status_code == 200
    store_id = sr.json()["id"]
    pr = client.post(
        "/api/products",
        json={
            "storeId": store_id,
            "productName": "Drill",
            "category": "construction",
            "pricePerDay": 10.0,
            "depositAmount": 20.0,
            "totalQuantity": 5,
        },
        headers=auth_header(token),
    )
    assert pr.status_code == 200, pr.text
    return email, token, pr.json()["id"], store_id


def test_products_mine_only_for_business_owner(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    r = client.get("/api/products/mine", headers=auth_header(token))
    assert r.status_code == 403


def test_products_mine_lists_owned_products(client):
    _, token, product_id, _ = _owner_with_store_and_product(client)
    r = client.get("/api/products/mine", headers=auth_header(token))
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == product_id
    assert items[0]["productName"] == "Drill"


def test_patch_product_updates_stock(client):
    _, token, product_id, _ = _owner_with_store_and_product(client)
    r = client.patch(
        f"/api/products/{product_id}",
        json={"totalQuantity": 2},
        headers=auth_header(token),
    )
    assert r.status_code == 200
    assert r.json()["totalQuantity"] == 2


def test_delete_product_blocked_when_booking_exists(client):
    _, owner_token, product_id, _ = _owner_with_store_and_product(client)

    cust_email = register_user(client, role="customer")
    cust_token = login(client, cust_email)

    start = date.today() + timedelta(days=10)
    end = start + timedelta(days=2)
    br = client.post(
        "/api/bookings",
        json={
            "equipmentId": product_id,
            "quantity": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
        headers=auth_header(cust_token),
    )
    assert br.status_code == 200, br.text

    dr = client.delete(
        f"/api/products/{product_id}",
        headers=auth_header(owner_token),
    )
    assert dr.status_code == 409


def test_delete_product_succeeds_without_bookings(client):
    _, token, product_id, _ = _owner_with_store_and_product(client)
    dr = client.delete(
        f"/api/products/{product_id}",
        headers=auth_header(token),
    )
    assert dr.status_code == 204

    gr = client.get(f"/api/products/{product_id}", headers=auth_header(token))
    assert gr.status_code == 404


def test_get_single_product_forbidden_for_other_owner(client):
    _, token_a, product_id, _ = _owner_with_store_and_product(client)
    email_b = register_user(client, role="business_owner")
    token_b = login(client, email_b)
    client.post(
        "/api/stores",
        json={"storeName": "Other"},
        headers=auth_header(token_b),
    )
    r = client.get(f"/api/products/{product_id}", headers=auth_header(token_b))
    assert r.status_code == 404
