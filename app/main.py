"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router
from app.core.config import configure_logging, get_settings


configure_logging()
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="POC backend for CSV-based personal spending analysis.",
)
app.include_router(router, prefix=settings.api_prefix)
