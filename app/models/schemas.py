"""Pydantic models for request and response payloads."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class SummaryMetrics(BaseModel):
    total_transactions: int
    total_spending: float
    average_transaction: float
    date_range: dict[str, str | None]


class CategoryBreakdownItem(BaseModel):
    category: str
    total_spending: float
    transaction_count: int
    share_percentage: float


class TrendPoint(BaseModel):
    period: str
    total_spending: float
    transaction_count: int


class MerchantStats(BaseModel):
    merchant: str
    total_spending: float
    transaction_count: int


class TransactionRecord(BaseModel):
    date: str
    category: str
    merchant: str
    amount: float


class AnomalyRecord(BaseModel):
    date: str
    merchant: str
    category: str
    amount: float
    threshold: float
    reason: str


class InsightItem(BaseModel):
    title: str
    evidence: str
    recommendation: str
    severity: str = Field(description="low, medium, or high")


class AnalyzeResponse(BaseModel):
    summary: SummaryMetrics
    category_breakdown: list[CategoryBreakdownItem]
    trends: dict[str, list[TrendPoint]]
    top_merchants: list[MerchantStats]
    largest_transactions: list[TransactionRecord]
    anomalies: list[AnomalyRecord]
    insights: list[InsightItem]
    metadata: dict[str, Any]


class ErrorResponse(BaseModel):
    detail: str
    errors: list[str] | None = None
