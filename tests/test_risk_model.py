"""Tests for spending-risk profile feature extraction and prediction."""

from __future__ import annotations

from app.services.risk_features import FEATURE_NAMES, build_profile_features
from app.services.risk_model import assess_spending_risk


def _analytics_result() -> dict:
    return {
        "summary": {
            "total_transactions": 10,
            "total_spending": 2400.0,
            "average_transaction": 240.0,
            "date_range": {"start": "2026-01-01", "end": "2026-01-31"},
        },
        "category_breakdown": [
            {"category": "Shopping", "share_percentage": 45.0},
            {"category": "Dining", "share_percentage": 18.0},
            {"category": "Subscriptions", "share_percentage": 10.0},
        ],
        "trends": {
            "weekly": [
                {"period": "2026-01-01/2026-01-07", "total_spending": 250.0},
                {"period": "2026-01-08/2026-01-14", "total_spending": 300.0},
                {"period": "2026-01-15/2026-01-21", "total_spending": 900.0},
            ]
        },
        "top_merchants": [{"merchant": "Store", "transaction_count": 4}],
        "anomalies": [{"amount": 900.0}, {"amount": 420.0}],
    }


def test_build_profile_features_matches_training_feature_order() -> None:
    features = build_profile_features(_analytics_result())

    assert list(features) == FEATURE_NAMES
    assert features["weekly_spike_ratio"] > 3
    assert features["repeat_merchant_ratio"] == 0.4


def test_assess_spending_risk_returns_runtime_contract() -> None:
    assessment = assess_spending_risk(_analytics_result())

    assert assessment["status"] in {"trained_model", "model_unavailable"}
    assert assessment["label"]
    assert assessment["severity"] in {"low", "medium", "high"}
    assert set(assessment["features"]) == set(FEATURE_NAMES)
