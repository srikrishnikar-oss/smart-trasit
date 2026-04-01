from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import close_pool, init_pool
from routers import alerts, analytics, auth, complaints, health, passes, routes, tracking
from settings import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_pool()
    yield
    close_pool()


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(routes.router, prefix="/api/routes", tags=["routes"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["tracking"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(passes.router, prefix="/api/passes", tags=["passes"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
