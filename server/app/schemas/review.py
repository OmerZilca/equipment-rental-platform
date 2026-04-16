from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class ReviewCreate(BaseModel):
    bookingId: int = Field(..., ge=1)
    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)

    @model_validator(mode="after")
    def rating_or_comment(self):
        has_stars = self.rating is not None
        text = (self.comment or "").strip()
        has_text = len(text) >= 3
        if not has_stars and not has_text:
            raise ValueError(
                "Provide a star rating and/or a comment of at least 3 characters."
            )
        return self


class ReviewRowOut(BaseModel):
    id: int
    rating: int | None = None
    comment: str | None = None
    reviewerName: str
    createdAt: datetime | None = None


class ReviewListResponse(BaseModel):
    items: list[ReviewRowOut]
    total: int
    averageRating: float
    reviewCount: int


class ReviewCreatedOut(BaseModel):
    id: int
    bookingId: int
    productId: int
    rating: int | None = None
    comment: str | None = None
