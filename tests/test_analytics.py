"""Tests for analytics outputs."""

from __future__ import annotations

import pandas as pd

from app.services.analytics import run_analytics


def _sample_dataframe() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "date": pd.to_datetime(
                ["2026-01-01", "2026-01-02", "2026-01-08", "2026-01-09", "2026-01-15"]
            ),
            "category": ["Rent", "Dining", "Shopping", "Shopping", "Dining"],
            "mapped_category": ["Rent", "Dining", "Shopping", "Shopping", "Dining"],
            "amount": [1000.0, 25.0, 80.0, 600.0, 30.0],
            "merchant": ["Landlord", "Cafe", "Store", "Laptop Shop", "Cafe"],
        }
    )


def test_run_analytics_returns_expected_summary() -> None:
    result = run_analytics(_sample_dataframe())

    assert result["summary"]["total_transactions"] == 5
    assert result["summary"]["total_spending"] == 1735.0
    assert result["category_breakdown"][0]["category"] == "Rent"
    assert len(result["trends"]["weekly"]) >= 2
    assert result["top_merchants"][0]["merchant"] == "Landlord"


def test_run_analytics_detects_large_transaction_anomaly() -> None:
    result = run_analytics(_sample_dataframe())

    assert len(result["anomalies"]) >= 1
    assert result["anomalies"][0]["amount"] >= 600.0
