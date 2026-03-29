from tests.utils import auth_header, login, register_user


def test_customer_cannot_create_product(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    r = client.post(
        "/api/products",
        json={
            "storeId": 1,
            "productName": "X",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 1,
        },
        headers=auth_header(token),
    )
    assert r.status_code == 403


def test_create_product_requires_valid_store(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    r = client.post(
        "/api/products",
        json={
            "storeId": 99999,
            "productName": "X",
            "pricePerDay": 1.0,
            "depositAmount": 1.0,
            "totalQuantity": 1,
        },
        headers=auth_header(token),
    )
    assert r.status_code == 404
