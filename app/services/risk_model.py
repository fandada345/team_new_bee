"""Runtime prediction for the exported spending-risk profile model."""

from __future__ import annotations

import json
import logging
import math
from pathlib import Path
from typing import Any

from app.services.risk_features import FEATURE_NAMES, build_profile_features
from app.utils.helpers import round_float


logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "spending_risk_model.json"


def _sigmoid(value: float) -> float:
    if value >= 0:
        return 1 / (1 + math.exp(-value))

    exp_value = math.exp(value)
    return exp_value / (1 + exp_value)


def _load_model() -> dict[str, Any] | None:
    try:
        model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        logger.info("Spending-risk model is not available at %s", MODEL_PATH)
        return None
    except json.JSONDecodeError:
        logger.exception("Spending-risk model JSON is invalid")
        return None

    if model.get("feature_names") != FEATURE_NAMES:
        logger.error("Spending-risk model features do not match runtime features")
        return None
    return model


def _severity(probability: float) -> str:
    if probability >= 0.75:
        return "high"
    if probability >= 0.45:
        return "medium"
    return "low"


def assess_spending_risk(analytics_result: dict[str, Any]) -> dict[str, Any]:
    """Predict whether a spending profile needs closer budget attention."""

    features = build_profile_features(analytics_result)
    model = _load_model()
    if model is None:
        return {
            "status": "model_unavailable",
            "label": "Not trained",
            "probability": None,
            "severity": "low",
            "summary": (
                "Train the SageMaker spending-risk model to add model-assisted "
                "profile scoring."
            ),
            "features": features,
        }

    means = model["scaler_mean"]
    scales = model["scaler_scale"]
    coefficients = model["coefficients"]
    intercept = float(model["intercept"])
    linear_score = intercept

    for name, mean, scale, coefficient in zip(
        FEATURE_NAMES, means, scales, coefficients, strict=True
    ):
        denominator = float(scale) or 1.0
        normalized_value = (features[name] - float(mean)) / denominator
        linear_score += normalized_value * float(coefficient)

    probability = _sigmoid(linear_score)
    threshold = float(model.get("threshold", 0.5))
    label = "Needs attention" if probability >= threshold else "On track"
    severity = _severity(probability)

    if label == "Needs attention":
        summary = (
            "The trained profile model sees a higher-risk mix of discretionary "
            "spending, weekly spikes, repeated merchants, or anomalies."
        )
    else:
        summary = (
            "The trained profile model sees a lower-risk spending mix for this "
            "upload."
        )

    return {
        "status": "trained_model",
        "label": label,
        "probability": round_float(probability),
        "severity": severity,
        "summary": summary,
        "features": features,
    }
