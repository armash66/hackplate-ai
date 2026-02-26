from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import init_db, get_db
from .auth.router import router as auth_router
from .events.router import router as events_router
from .notifications.router import router as notifications_router
from .analytics.router import router as analytics_router
from .ingestion.runner import run_ingestion
from .notifications.engine import match_and_notify


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB tables."""
    init_db()
    print("  [startup] Database initialized")
    yield


app = FastAPI(
    title="HackPlate API",
    description="Student Event Intelligence Platform -- Find hackathons with food.",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS -- allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(events_router)
app.include_router(notifications_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {"service": "HackPlate API", "version": "3.0.0", "status": "running"}


@app.post("/ingest", tags=["ingestion"])
def trigger_ingestion(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Trigger a manual ingestion run.
    Scrapes all sources, scores, deduplicates, stores, and notifies.
    """
    new_events = run_ingestion(db, limit=limit)
    match_and_notify(db, new_events)
    return {
        "message": f"Ingestion complete. {len(new_events)} new events stored.",
        "new_events": len(new_events),
    }
