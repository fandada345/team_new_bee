"""Application configuration and logging setup."""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    """Static settings for the proof-of-concept backend."""

    app_name: str = "Spend Insight AI"
    app_version: str = "0.1.0"
    api_prefix: str = ""
    log_level: str = "INFO"
    max_upload_size_mb: int = 5
    anomaly_iqr_multiplier: float = 1.5
    anomaly_zscore_threshold: float = 2.0
    default_top_n_merchants: int = 5
    default_largest_transactions: int = 5
    base_dir: Path = Path(__file__).resolve().parents[2]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()


def configure_logging() -> None:
    """Set up basic structured logging for the demo app."""

    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
