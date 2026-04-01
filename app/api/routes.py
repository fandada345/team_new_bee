"""FastAPI routes for transaction analysis."""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.models.schemas import AnalyzeResponse, ErrorResponse
from app.services.pipeline import analyze_transactions
from app.services.validator import DataValidationError
from app.utils.helpers import load_csv_bytes


logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    """Simple health endpoint for smoke testing."""

    return {"status": "ok"}


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={400: {"model": ErrorResponse}},
)
async def analyze_csv(file: UploadFile = File(...)) -> AnalyzeResponse:
    """Accept a CSV file upload, analyze spending, and return JSON."""

    logger.info("Received upload for analysis: %s", file.filename)

    if not file.filename.lower().endswith(".csv"):
        logger.error("Rejected non-CSV upload: %s", file.filename)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Only CSV files are supported.", "errors": []},
        )

    try:
        file_bytes = await file.read()
        raw_df = load_csv_bytes(file_bytes)
        result = analyze_transactions(raw_df)
        return AnalyzeResponse(**result)
    except DataValidationError as exc:
        logger.error("Validation error during upload analysis: %s", exc.message)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message, "errors": exc.errors},
        )
    except ValueError as exc:
        logger.error("File loading error: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc), "errors": []},
        )
    except Exception as exc:  # pragma: no cover - defensive logging for demo app
        logger.exception("Unexpected analysis error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during analysis: {exc}",
        ) from exc
