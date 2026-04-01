"""Rule-based natural-language insight generation."""

from __future__ import annotations

import logging
from typing import Any


logger = logging.getLogger(__name__)


def generate_insights(analytics_result: dict[str, Any]) -> list[dict[str, str]]:
    """Generate explainable rule-based insights from analytics output."""

    logger.info("Generating rule-based insights")
    insights: list[dict[str, str]] = []

    category_breakdown = analytics_result["category_breakdown"]
    weekly_trend = analytics_result["trends"]["weekly"]
    top_merchants = analytics_result["top_merchants"]
    anomalies = analytics_result["anomalies"]
    summary = analytics_result["summary"]

    if category_breakdown:
        top_category = category_breakdown[0]
        severity = "high" if top_category["share_percentage"] >= 35 else "medium"
        insights.append(
            {
                "title": f"{top_category['category']} is your highest spending category",
                "evidence": (
                    f"You spent ${top_category['total_spending']} on {top_category['category']}, "
                    f"which is {top_category['share_percentage']}% of total spending."
                ),
                "recommendation": (
                    f"Review your recent {top_category['category'].lower()} transactions and "
                    "set a target reduction for the next month."
                ),
                "severity": severity,
            }
        )

    if len(weekly_trend) >= 2:
        latest_week = weekly_trend[-1]
        previous_weeks = weekly_trend[:-1]
        average_previous = sum(item["total_spending"] for item in previous_weeks) / len(
            previous_weeks
        )
        if average_previous > 0 and latest_week["total_spending"] > average_previous * 1.25:
            insights.append(
                {
                    "title": "Weekly spending has spiked recently",
                    "evidence": (
                        f"The latest week ({latest_week['period']}) reached "
                        f"${latest_week['total_spending']}, above the previous weekly average of "
                        f"${round(average_previous, 2)}."
                    ),
                    "recommendation": (
                        "Check the transactions from the latest week to confirm whether the spike "
                        "was a one-off expense or a developing trend."
                    ),
                    "severity": "high",
                }
            )

    if top_merchants:
        frequent_merchant = max(top_merchants, key=lambda item: item["transaction_count"])
        if frequent_merchant["transaction_count"] >= 3:
            insights.append(
                {
                    "title": f"Repeated spending detected at {frequent_merchant['merchant']}",
                    "evidence": (
                        f"{frequent_merchant['merchant']} appeared "
                        f"{frequent_merchant['transaction_count']} times for a total of "
                        f"${frequent_merchant['total_spending']}."
                    ),
                    "recommendation": (
                        "Review whether this merchant reflects a routine expense worth budgeting "
                        "more explicitly."
                    ),
                    "severity": "medium",
                }
            )

    subscriptions = next(
        (item for item in category_breakdown if item["category"] == "Subscriptions"),
        None,
    )
    if subscriptions and subscriptions["share_percentage"] >= 8:
        insights.append(
            {
                "title": "Subscription costs are becoming meaningful",
                "evidence": (
                    f"Subscriptions account for ${subscriptions['total_spending']} "
                    f"or {subscriptions['share_percentage']}% of spending."
                ),
                "recommendation": (
                    "Audit active subscriptions and cancel low-value services to reduce fixed monthly costs."
                ),
                "severity": "medium",
            }
        )

    if anomalies:
        largest_anomaly = anomalies[0]
        insights.append(
            {
                "title": "Unusual large transaction flagged",
                "evidence": (
                    f"{largest_anomaly['merchant']} on {largest_anomaly['date']} was "
                    f"${largest_anomaly['amount']}, above the threshold of "
                    f"${largest_anomaly['threshold']}."
                ),
                "recommendation": (
                    "Confirm whether this transaction was planned. If not, investigate and adjust the budget."
                ),
                "severity": "high",
            }
        )

    if len(insights) < 3:
        insights.append(
            {
                "title": "Spending base line established",
                "evidence": (
                    f"The dataset contains {summary['total_transactions']} transactions totaling "
                    f"${summary['total_spending']}."
                ),
                "recommendation": (
                    "Use this baseline as a reference point for future uploads and month-over-month comparisons."
                ),
                "severity": "low",
            }
        )

    return insights[:5]
