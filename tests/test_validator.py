"""Tests for CSV validation rules."""

from __future__ import annotations

import pandas as pd
import pytest

from app.services.validator import DataValidationError, raise_if_invalid, validate_transactions


def test_validate_transactions_happy_path() -> None:
    df = pd.DataFrame(
        {
            "date": ["2026-01-01", "2026-01-02"],
            "category": ["Groceries", "Dining"],
            "amount": [10.5, 20.0],
        }
    )

    result = validate_transactions(df)

    assert result.is_valid is True
    assert result.errors == []


def test_validate_transactions_returns_helpful_errors() -> None:
    df = pd.DataFrame(
        {
            "date": ["bad-date"],
            "category": ["Groceries"],
            "amount": ["oops"],
        }
    )

    result = validate_transactions(df)

    assert result.is_valid is False
    assert any("Invalid date values detected" in error for error in result.errors)
    assert any("Invalid amount values detected" in error for error in result.errors)


def test_raise_if_invalid_raises_structured_error() -> None:
    df = pd.DataFrame({"date": [], "category": [], "amount": []})

    with pytest.raises(DataValidationError) as exc_info:
        raise_if_invalid(df)

    assert exc_info.value.errors == ["The uploaded CSV contains no rows."]
