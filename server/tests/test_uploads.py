import base64
import io

from tests.utils import auth_header, login, register_user

_MIN_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def test_upload_requires_business_owner(client):
    email = register_user(client, role="customer")
    token = login(client, email)
    files = {"file": ("x.png", io.BytesIO(_MIN_PNG), "image/png")}
    r = client.post(
        "/api/uploads/product-image",
        files=files,
        headers=auth_header(token),
    )
    assert r.status_code == 403


def test_upload_returns_public_url(client):
    email = register_user(client, role="business_owner")
    token = login(client, email)
    files = {"file": ("x.png", io.BytesIO(_MIN_PNG), "image/png")}
    r = client.post(
        "/api/uploads/product-image",
        files=files,
        headers=auth_header(token),
    )
    assert r.status_code == 200, r.text
    url = r.json()["url"]
    assert "/uploads/" in url

    # Static file is served
    path = url.split("/uploads/", 1)[-1]
    gr = client.get(f"/uploads/{path}")
    assert gr.status_code == 200
    assert gr.content == _MIN_PNG
