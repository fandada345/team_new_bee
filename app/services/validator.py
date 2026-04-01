"""CSV validation logic."""

from __future__ import annotations

from dataclasses import dataclass
import logging

import pandas as pd


logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {"date", "category", "amount"}


class DataValidationError(Exception):
    """Raised when uploaded transaction data is invalid."""

    def __init__(self, message: str, errors: list[str] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.errors = errors or []


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str]


def validate_transactions(df: pd.DataFrame) -> ValidationResult:
    """Validate raw transaction data before cleaning."""

    logger.info("Validating uploaded transaction data")

    errors: list[str] = []

    if df.empty:
        errors.append("The uploaded CSV contains no rows.")
        return ValidationResult(is_valid=False, errors=errors)

    normalized_columns = [str(column).strip().lower() for column in df.columns]
    missing_columns = sorted(REQUIRED_COLUMNS.difference(normalized_columns))
    if missing_columns:
        errors.append(
            f"Missing required columns: {', '.join(missing_columns)}."
        )
        return ValidationResult(is_valid=False, errors=errors)

    preview_df = df.copy()
    preview_df.columns = normalized_columns

    invalid_date_mask = pd.to_datetime(preview_df["date"], errors="coerce").isna()
    if invalid_date_mask.any():
        sample_rows = (invalid_date_mask[invalid_date_mask].index + 2).tolist()[:5]
        errors.append(
            "Invalid date values detected. Check rows: "
            + ", ".join(str(row) for row in sample_rows)
            + "."
        )

    invalid_amount_mask = pd.to_numeric(preview_df["amount"], errors="coerce").isna()
    if invalid_amount_mask.any():
        sample_rows = (invalid_amount_mask[invalid_amount_mask].index + 2).tolist()[:5]
        errors.append(
            "Invalid amount values detected. Check rows: "
            + ", ".join(str(row) for row in sample_rows)
            + "."
        )

    return ValidationResult(is_valid=not errors, errors=errors)


def raise_if_invalid(df: pd.DataFrame) -> None:
    """Validate a DataFrame and raise a structured exception if invalid."""

    result = validate_transactions(df)
    if not result.is_valid:
        logger.error("Validation failed with %s error(s)", len(result.errors))
        raise DataValidationError(
            message="Uploaded CSV failed validation.",
            errors=result.errors,
        )
