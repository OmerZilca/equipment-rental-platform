"""File uploads for product images.

- POST /api/uploads/product-image — business owners only. Saves JPEG/PNG/WebP/GIF
  up to 5 MB and returns a public URL under /uploads/...
"""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from app.api.dependencies.auth import get_current_user
from app.db.models import User

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

SERVER_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_DIR = SERVER_ROOT / "uploads"

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_BYTES = 5 * 1024 * 1024


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/product-image")
async def upload_product_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "business_owner":
        raise HTTPException(
            status_code=403,
            detail="Only business owners can upload product images",
        )

    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid image type. Use JPEG, PNG, WebP, or GIF.",
        )

    body = await file.read()
    if len(body) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image too large (max 5 MB).",
        )

    ensure_upload_dir()
    ext = ALLOWED_TYPES[content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    dest.write_bytes(body)

    base = str(request.base_url).rstrip("/")
    return {"url": f"{base}/uploads/{filename}"}
