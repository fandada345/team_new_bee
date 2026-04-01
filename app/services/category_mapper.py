"""Rule-based category mapping into the fixed taxonomy."""

from __future__ import annotations

import logging

import pandas as pd


logger = logging.getLogger(__name__)

FIXED_TAXONOMY = [
    "Groceries",
    "Dining",
    "Transport",
    "Rent",
    "Utilities",
    "Subscriptions",
    "Shopping",
    "Other",
]

CATEGORY_MAPPING: dict[str, str] = {
    "grocery": "Groceries",
    "groceries": "Groceries",
    "supermarket": "Groceries",
    "food": "Groceries",
    "restaurant": "Dining",
    "dining": "Dining",
    "cafe": "Dining",
    "coffee": "Dining",
    "takeaway": "Dining",
    "uber eats": "Dining",
    "transport": "Transport",
    "fuel": "Transport",
    "gas": "Transport",
    "taxi": "Transport",
    "uber": "Transport",
    "train": "Transport",
    "parking": "Transport",
    "rent": "Rent",
    "mortgage": "Rent",
    "utility": "Utilities",
    "utilities": "Utilities",
    "electricity": "Utilities",
    "water": "Utilities",
    "internet": "Utilities",
    "phone": "Utilities",
    "subscription": "Subscriptions",
    "subscriptions": "Subscriptions",
    "streaming": "Subscriptions",
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "shopping": "Shopping",
    "retail": "Shopping",
    "clothing": "Shopping",
    "electronics": "Shopping",
}


def map_categories(df: pd.DataFrame) -> pd.DataFrame:
    """Map raw categories to the fixed taxonomy."""

    logger.info("Mapping categories to fixed taxonomy")

    mapped = df.copy()
    normalized = mapped["category"].astype(str).str.strip().str.lower()

    mapped["mapped_category"] = normalized.map(CATEGORY_MAPPING)
    unmapped_direct_match = normalized.str.title().where(
        normalized.str.title().isin(FIXED_TAXONOMY)
    )
    mapped["mapped_category"] = mapped["mapped_category"].combine_first(
        unmapped_direct_match
    )
    mapped["mapped_category"] = mapped["mapped_category"].fillna("Other")

    return mapped
