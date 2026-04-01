"""Tests for data cleaning behavior."""

from __future__ import annotations

import pandas as pd

from app.services.cleaner import clean_transactions
from app.services.category_mapper import map_categories


def test_clean_transactions_standardizes_fields_and_drops_duplicates() -> None:
    df = pd.DataFrame(
        {
            "Date": ["2026-01-01", "2026-01-01", "2026-01-02"],
            "Category": [" groceries ", " groceries ", None],
            "Amount": ["10.50", "10.50", "-20"],
            "Merchant": [" coles ", " coles ", ""],
        }
    )

    cleaned = clean_transactions(df)

    assert list(cleaned.columns) == ["date", "category", "amount", "merchant"]
    assert len(cleaned) == 2
    assert cleaned.loc[0, "category"] == "Groceries"
    assert cleaned.loc[0, "merchant"] == "Coles"
    assert cleaned.loc[1, "merchant"] == "Unknown Merchant"
    assert cleaned.loc[1, "amount"] == 20.0


def test_map_categories_assigns_other_for_unknown_values() -> None:
    df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2026-01-01"]),
            "category": ["Pet Care"],
            "amount": [30.0],
            "merchant": ["Vet"],
        }
    )

    mapped = map_categories(df)

    assert mapped.loc[0, "mapped_category"] == "Other"
