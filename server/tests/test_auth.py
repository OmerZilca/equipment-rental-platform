from tests.utils import auth_header, login, register_user


def test_register_and_me(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    r = client.get("/api/auth/me", headers=auth_header(token))
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email
    assert data["role"] == "customer"


def test_me_requires_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401
