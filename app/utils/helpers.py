"""Helper utilities for file loading and common formatting."""

from __future__ import annotations

from io import BytesIO
import logging
from typing import Any

import pandas as pd
from pandas.errors import EmptyDataError


logger = logging.getLogger(__name__)


def load_csv_bytes(file_bytes: bytes) -> pd.DataFrame:
    """Load CSV bytes into a DataFrame."""

    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    logger.info("Loading CSV bytes into DataFrame")
    try:
        return pd.read_csv(BytesIO(file_bytes))
    except EmptyDataError as exc:
        raise ValueError("Uploaded CSV is empty or has no readable rows.") from exc


def round_float(value: float, digits: int = 2) -> float:
    """Round floats consistently for JSON responses."""

    return round(float(value), digits)


def dataframe_to_records(df: pd.DataFrame, columns: list[str]) -> list[dict[str, Any]]:
    """Convert selected DataFrame columns to JSON-safe records."""

    safe_df = df.loc[:, columns].copy()
    if "date" in safe_df.columns:
        safe_df["date"] = safe_df["date"].dt.strftime("%Y-%m-%d")
    return safe_df.to_dict(orient="records")
