from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
import app.models  # noqa: F401 — registers models with Base
from app.routers import auth, events, bids, bookings, restaurants


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    # Seed if empty
    db = SessionLocal()
    try:
        from app.models.user import User

        if db.query(User).count() == 0:
            from app.seed import seed_database

            seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(title="BidAppetit API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bids.router)
app.include_router(bookings.router)
app.include_router(restaurants.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
