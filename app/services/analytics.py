"""Analytics and aggregation logic for spending insights."""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd

from app.core.config import get_settings
from app.utils.helpers import dataframe_to_records, round_float


logger = logging.getLogger(__name__)


def _build_category_breakdown(df: pd.DataFrame) -> list[dict[str, Any]]:
    total_spending = df["amount"].sum()
    grouped = (
        df.groupby("mapped_category", dropna=False)
        .agg(total_spending=("amount", "sum"), transaction_count=("amount", "count"))
        .reset_index()
        .sort_values("total_spending", ascending=False)
    )
    grouped["share_percentage"] = np.where(
        total_spending > 0,
        grouped["total_spending"] / total_spending * 100,
        0,
    )

    return [
        {
            "category": row["mapped_category"],
            "total_spending": round_float(row["total_spending"]),
            "transaction_count": int(row["transaction_count"]),
            "share_percentage": round_float(row["share_percentage"]),
        }
        for _, row in grouped.iterrows()
    ]


def _build_trend(df: pd.DataFrame, freq: str) -> list[dict[str, Any]]:
    period = df["date"].dt.to_period(freq)
    trend = (
        df.assign(period=period.astype(str))
        .groupby("period")
        .agg(total_spending=("amount", "sum"), transaction_count=("amount", "count"))
        .reset_index()
        .sort_values("period")
    )

    return [
        {
            "period": row["period"],
            "total_spending": round_float(row["total_spending"]),
            "transaction_count": int(row["transaction_count"]),
        }
        for _, row in trend.iterrows()
    ]


def detect_anomalies(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Detect unusually large transactions with explainable rules."""

    settings = get_settings()
    amounts = df["amount"]
    q1 = amounts.quantile(0.25)
    q3 = amounts.quantile(0.75)
    iqr = q3 - q1
    iqr_threshold = q3 + settings.anomaly_iqr_multiplier * iqr if iqr > 0 else q3

    mean_amount = amounts.mean()
    std_amount = amounts.std(ddof=0)
    zscore_threshold = (
        mean_amount + settings.anomaly_zscore_threshold * std_amount
        if std_amount > 0
        else mean_amount
    )

    candidate_thresholds = [
        threshold_value
        for threshold_value in [iqr_threshold, zscore_threshold, mean_amount * 1.8]
        if threshold_value > 0
    ]
    threshold = min(candidate_thresholds) if candidate_thresholds else mean_amount

    anomalies = df[df["amount"] > threshold].copy()
    if anomalies.empty:
        return []

    anomalies["reason"] = anomalies["amount"].apply(
        lambda amount: (
            f"Transaction is above the unusual-spend threshold of ${round_float(threshold)}."
        )
    )
    anomalies["threshold"] = threshold

    records = dataframe_to_records(
        anomalies.sort_values("amount", ascending=False),
        ["date", "merchant", "mapped_category", "amount", "threshold", "reason"],
    )
    for record in records:
        record["category"] = record.pop("mapped_category")
        record["amount"] = round_float(record["amount"])
        record["threshold"] = round_float(record["threshold"])
    return records


def run_analytics(df: pd.DataFrame) -> dict[str, Any]:
    """Generate summary metrics, trends, merchant analysis, and anomalies."""

    logger.info("Running spending analytics")
    settings = get_settings()

    total_spending = df["amount"].sum()
    total_transactions = int(len(df))
    average_transaction = total_spending / total_transactions if total_transactions else 0.0

    summary = {
        "total_transactions": total_transactions,
        "total_spending": round_float(total_spending),
        "average_transaction": round_float(average_transaction),
        "date_range": {
            "start": df["date"].min().strftime("%Y-%m-%d") if total_transactions else None,
            "end": df["date"].max().strftime("%Y-%m-%d") if total_transactions else None,
        },
    }

    top_merchants_df = (
        df.groupby("merchant", dropna=False)
        .agg(total_spending=("amount", "sum"), transaction_count=("amount", "count"))
        .reset_index()
        .sort_values(["total_spending", "transaction_count"], ascending=[False, False])
        .head(settings.default_top_n_merchants)
    )
    top_merchants = [
        {
            "merchant": row["merchant"],
            "total_spending": round_float(row["total_spending"]),
            "transaction_count": int(row["transaction_count"]),
        }
        for _, row in top_merchants_df.iterrows()
    ]

    largest_df = (
        df.sort_values("amount", ascending=False)
        .head(settings.default_largest_transactions)
        .copy()
    )
    largest_records = dataframe_to_records(
        largest_df, ["date", "mapped_category", "merchant", "amount"]
    )
    for record in largest_records:
        record["category"] = record.pop("mapped_category")
        record["amount"] = round_float(record["amount"])

    analytics_output = {
        "summary": summary,
        "category_breakdown": _build_category_breakdown(df),
        "trends": {
            "weekly": _build_trend(df, "W"),
            "monthly": _build_trend(df, "M"),
        },
        "top_merchants": top_merchants,
        "largest_transactions": largest_records,
        "anomalies": detect_anomalies(df),
    }

    return analytics_output
