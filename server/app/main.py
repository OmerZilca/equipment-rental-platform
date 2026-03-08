from fastapi import FastAPI
from app.api.routers import equipment

app = FastAPI()


app.include_router(equipment.router)


@app.get("/")
def root():
    return {"message": "Equipment Rental API is running"}