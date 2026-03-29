import uuid

from fastapi.testclient import TestClient


def unique_email(prefix: str = "u") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}@test.local"


def register_user(
    client: TestClient,
    *,
    role: str,
    email: str | None = None,
    password: str = "testpass123",
) -> str:
    email = email or unique_email(role)
    r = client.post(
        "/api/users",
        json={
            "fullName": "Test User",
            "email": email,
            "password": password,
            "role": role,
        },
    )
    assert r.status_code == 200, r.text
    return email


def login(client: TestClient, email: str, password: str = "testpass123") -> str:
    r = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
