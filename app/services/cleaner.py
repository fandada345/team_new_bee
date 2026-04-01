"""Data cleaning and preprocessing utilities."""

from __future__ import annotations

import logging

import pandas as pd


logger = logging.getLogger(__name__)


def clean_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and normalize transaction data for downstream analysis."""

    logger.info("Cleaning transaction data")

    cleaned = df.copy()
    cleaned.columns = [str(column).strip().lower() for column in cleaned.columns]

    if "merchant" not in cleaned.columns:
        cleaned["merchant"] = "Unknown Merchant"

    cleaned["date"] = pd.to_datetime(cleaned["date"], errors="coerce")
    cleaned["amount"] = pd.to_numeric(cleaned["amount"], errors="coerce")

    cleaned["category"] = (
        cleaned["category"]
        .fillna("Other")
        .astype(str)
        .str.strip()
        .str.title()
    )
    cleaned["merchant"] = (
        cleaned["merchant"]
        .fillna("Unknown Merchant")
        .astype(str)
        .str.strip()
        .replace("", "Unknown Merchant")
        .str.title()
    )

    cleaned = cleaned.dropna(subset=["date", "amount"])
    cleaned["amount"] = cleaned["amount"].abs()

    cleaned = cleaned.drop_duplicates()
    cleaned = cleaned.sort_values("date").reset_index(drop=True)

    logger.info("Cleaned dataset contains %s rows", len(cleaned))
    return cleaned
