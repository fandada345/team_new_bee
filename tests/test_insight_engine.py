"""Tests for rule-based insight generation."""

from __future__ import annotations

from app.services.insight_engine import generate_insights


def test_generate_insights_returns_at_least_three_items() -> None:
    analytics_result = {
        "summary": {
            "total_transactions": 6,
            "total_spending": 1200.0,
            "average_transaction": 200.0,
            "date_range": {"start": "2026-01-01", "end": "2026-01-31"},
        },
        "category_breakdown": [
            {
                "category": "Shopping",
                "total_spending": 600.0,
                "transaction_count": 2,
                "share_percentage": 50.0,
            },
            {
                "category": "Subscriptions",
                "total_spending": 120.0,
                "transaction_count": 3,
                "share_percentage": 10.0,
            },
        ],
        "trends": {
            "weekly": [
                {"period": "2026-01-01/2026-01-07", "total_spending": 150.0, "transaction_count": 2},
                {"period": "2026-01-08/2026-01-14", "total_spending": 180.0, "transaction_count": 1},
                {"period": "2026-01-15/2026-01-21", "total_spending": 500.0, "transaction_count": 3},
            ],
            "monthly": [{"period": "2026-01", "total_spending": 1200.0, "transaction_count": 6}],
        },
        "top_merchants": [
            {"merchant": "Netflix", "total_spending": 60.0, "transaction_count": 3},
            {"merchant": "Big Store", "total_spending": 600.0, "transaction_count": 1},
        ],
        "largest_transactions": [],
        "anomalies": [
            {
                "date": "2026-01-20",
                "merchant": "Big Store",
                "category": "Shopping",
                "amount": 450.0,
                "threshold": 200.0,
                "reason": "Transaction is above threshold.",
            }
        ],
    }

    insights = generate_insights(analytics_result)

    assert len(insights) >= 3
    assert all("title" in insight for insight in insights)
    assert all("evidence" in insight for insight in insights)
    assert all("recommendation" in insight for insight in insights)
    assert all("severity" in insight for insight in insights)
