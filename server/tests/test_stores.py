from tests.utils import auth_header, login, register_user


def test_only_one_store_per_owner(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)

    r1 = client.post(
        "/api/stores",
        json={"storeName": "First Store", "description": "A"},
        headers=auth_header(token),
    )
    assert r1.status_code == 200, r1.text

    r2 = client.post(
        "/api/stores",
        json={"storeName": "Second Store"},
        headers=auth_header(token),
    )
    assert r2.status_code == 400
    assert "already have a store" in r2.json()["detail"].lower()


def test_customer_cannot_create_store(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    r = client.post(
        "/api/stores",
        json={"storeName": "X"},
        headers=auth_header(token),
    )
    assert r.status_code == 403


def test_my_stores_lists_owner_store(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    client.post(
        "/api/stores",
        json={"storeName": "Solo", "address": "1 Main"},
        headers=auth_header(token),
    )
    r = client.get("/api/stores/mine", headers=auth_header(token))
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 1
    assert data["items"][0]["storeName"] == "Solo"


def test_owner_can_patch_store(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    client.post(
        "/api/stores",
        json={"storeName": "Original", "description": "Old"},
        headers=auth_header(token),
    )
    r = client.patch(
        "/api/stores/mine",
        json={"description": "New text", "openingHours": "10–18"},
        headers=auth_header(token),
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["storeName"] == "Original"
    assert body["description"] == "New text"
    assert body["openingHours"] == "10–18"


def test_patch_store_without_store_404(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    r = client.patch(
        "/api/stores/mine",
        json={"storeName": "X"},
        headers=auth_header(token),
    )
    assert r.status_code == 404


def test_customer_cannot_patch_store(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    r = client.patch(
        "/api/stores/mine",
        json={"storeName": "X"},
        headers=auth_header(token),
    )
    assert r.status_code == 403


def test_get_public_store_by_id(client):
    r = client.get("/api/stores/1")
    assert r.status_code == 200
    body = r.json()
    assert "storeName" in body
    assert body["id"] == 1


def test_get_public_store_not_found(client):
    r = client.get("/api/stores/999999")
    assert r.status_code == 404
