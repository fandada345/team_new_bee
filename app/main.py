"""FastAPI application entry point."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import configure_logging, get_settings


configure_logging()
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="POC backend for CSV-based personal spending analysis.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix=settings.api_prefix)

frontend_dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"
frontend_assets = frontend_dist / "assets"

if frontend_assets.exists():
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="frontend-assets")


@app.get("/", include_in_schema=False)
def frontend_index():
    """Serve the built dashboard when the React frontend has been built."""

    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return JSONResponse(
        {
            "message": "Frontend build not found. Run npm install and npm run build in frontend, or use npm run dev."
        }
    )
