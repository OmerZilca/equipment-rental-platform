from tests.utils import register_user


def test_duplicate_email_rejected(client):
    email = register_user(client, role="customer")
    r = client.post(
        "/api/users",
        json={
            "fullName": "Other",
            "email": email,
            "password": "x",
            "role": "customer",
        },
    )
    assert r.status_code == 400
    assert "email" in r.json()["detail"].lower()
