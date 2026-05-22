"""Shared orchestration pipeline for API and CLI entry points."""

from __future__ import annotations

import logging
from typing import Any

import pandas as pd

from app.services.analytics import run_analytics
from app.services.category_mapper import map_categories
from app.services.cleaner import clean_transactions
from app.services.insight_engine import generate_insights
from app.services.risk_model import assess_spending_risk
from app.services.validator import raise_if_invalid


logger = logging.getLogger(__name__)


def analyze_transactions(df: pd.DataFrame) -> dict[str, Any]:
    """Run the full request handler to insight generator pipeline."""

    logger.info("Starting transaction analysis pipeline")

    raise_if_invalid(df)
    cleaned = clean_transactions(df)
    mapped = map_categories(cleaned)
    analytics_result = run_analytics(mapped)
    insights = generate_insights(analytics_result)
    risk_assessment = assess_spending_risk(analytics_result)

    analytics_result["insights"] = insights
    analytics_result["risk_assessment"] = risk_assessment
    analytics_result["metadata"] = {
        "pipeline": [
            "Request Handler",
            "Validation",
            "Data Processing",
            "Analytics",
            "Insight Generator",
            "Risk Model",
            "Output",
        ],
        "taxonomy": [
            "Groceries",
            "Dining",
            "Transport",
            "Rent",
            "Utilities",
            "Subscriptions",
            "Shopping",
            "Other",
        ],
        "rules": {
            "category_mapping": "Dictionary-based mapping with 'Other' fallback",
            "anomaly_detection": "Global transaction threshold using IQR, z-score proxy, and spend multiple",
            "insight_engine": "Deterministic rules using category concentration, trends, merchant repetition, subscriptions, and anomalies",
            "risk_model": "Profile classifier trained from synthetic spending-risk examples and exported as JSON",
        },
    }

    logger.info("Analysis pipeline completed successfully")
    return analytics_result
