"""Feature extraction for the spending-risk training and inference paths."""

from __future__ import annotations

from typing import Any

from app.utils.helpers import round_float


FEATURE_NAMES = [
    "shopping_share",
    "dining_share",
    "subscriptions_share",
    "weekly_spike_ratio",
    "repeat_merchant_ratio",
    "anomaly_count",
    "average_transaction",
]


def _category_share(analytics_result: dict[str, Any], category: str) -> float:
    match = next(
        (
            item
            for item in analytics_result["category_breakdown"]
            if item["category"] == category
        ),
        None,
    )
    return float(match["share_percentage"]) if match else 0.0


def _weekly_spike_ratio(analytics_result: dict[str, Any]) -> float:
    weekly_trend = analytics_result["trends"]["weekly"]
    if len(weekly_trend) < 2:
        return 1.0

    latest_spending = float(weekly_trend[-1]["total_spending"])
    previous_spending = [
        float(point["total_spending"]) for point in weekly_trend[:-1]
    ]
    average_previous = sum(previous_spending) / len(previous_spending)
    return latest_spending / average_previous if average_previous > 0 else 1.0


def _repeat_merchant_ratio(analytics_result: dict[str, Any]) -> float:
    total_transactions = analytics_result["summary"]["total_transactions"]
    if not total_transactions or not analytics_result["top_merchants"]:
        return 0.0

    repeat_count = max(
        merchant["transaction_count"] for merchant in analytics_result["top_merchants"]
    )
    return repeat_count / total_transactions


def build_profile_features(analytics_result: dict[str, Any]) -> dict[str, float]:
    """Convert one dashboard analysis into profile-level model features."""

    features = {
        "shopping_share": _category_share(analytics_result, "Shopping"),
        "dining_share": _category_share(analytics_result, "Dining"),
        "subscriptions_share": _category_share(
            analytics_result, "Subscriptions"
        ),
        "weekly_spike_ratio": _weekly_spike_ratio(analytics_result),
        "repeat_merchant_ratio": _repeat_merchant_ratio(analytics_result),
        "anomaly_count": float(len(analytics_result["anomalies"])),
        "average_transaction": float(
            analytics_result["summary"]["average_transaction"]
        ),
    }
    return {name: round_float(features[name]) for name in FEATURE_NAMES}
