"""Train the spending-risk profile model and report the run to ClearML."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any

import pandas as pd
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score, f1_score, log_loss
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.services.risk_features import FEATURE_NAMES
from scripts.generate_training_data import write_training_data


DEFAULT_DATASET = PROJECT_ROOT / "data" / "spending_risk_training.csv"
DEFAULT_MODEL = PROJECT_ROOT / "models" / "spending_risk_model.json"
DEFAULT_METRICS = PROJECT_ROOT / "models" / "spending_risk_metrics.json"


def _clearml_task(enabled: bool, params: dict[str, Any]) -> Any | None:
    if not enabled:
        return None

    try:
        from clearml import Task
    except ImportError as exc:
        raise RuntimeError(
            "ClearML is missing. Run pip install -r requirements-clearml.txt "
            "or pass --no-clearml for a local smoke test."
        ) from exc

    task = Task.init(
        project_name="Spend Insight AI",
        task_name="SageMaker Spending Risk Training",
        reuse_last_task_id=False,
    )
    task.connect(params, name="training_parameters")
    return task


def _report_epoch(logger: Any | None, epoch: int, metrics: dict[str, float]) -> None:
    if logger is None:
        return

    for metric_name, metric_value in metrics.items():
        logger.report_scalar(
            title="spending_risk_training",
            series=metric_name,
            value=metric_value,
            iteration=epoch,
        )


def _export_model(
    scaler: StandardScaler,
    classifier: SGDClassifier,
    model_path: Path,
) -> dict[str, Any]:
    exported = {
        "model_type": "sgd_logistic_profile_classifier",
        "feature_names": FEATURE_NAMES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "coefficients": classifier.coef_[0].tolist(),
        "intercept": float(classifier.intercept_[0]),
        "threshold": 0.5,
        "positive_label": "Needs attention",
        "negative_label": "On track",
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    model_path.write_text(json.dumps(exported, indent=2), encoding="utf-8")
    return exported


def train(args: argparse.Namespace) -> dict[str, Any]:
    if not args.dataset.exists():
        write_training_data(args.dataset, rows=args.rows, seed=args.seed)

    dataset = pd.read_csv(args.dataset)
    X = dataset[FEATURE_NAMES]
    y = dataset["needs_attention"].astype(int)
    X_train, X_valid, y_train, y_valid = train_test_split(
        X,
        y,
        test_size=args.validation_size,
        random_state=args.seed,
        stratify=y,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_valid_scaled = scaler.transform(X_valid)
    classifier = SGDClassifier(
        loss="log_loss",
        learning_rate="constant",
        eta0=args.learning_rate,
        alpha=args.alpha,
        random_state=args.seed,
    )

    try:
        dataset_name = str(args.dataset.resolve().relative_to(PROJECT_ROOT))
    except ValueError:
        dataset_name = str(args.dataset)

    params = {
        "dataset": dataset_name,
        "epochs": args.epochs,
        "seed": args.seed,
        "validation_size": args.validation_size,
        "learning_rate": args.learning_rate,
        "alpha": args.alpha,
        "rows": len(dataset),
    }
    task = _clearml_task(not args.no_clearml, params)
    logger = task.get_logger() if task else None
    epoch_metrics: list[dict[str, float | int]] = []

    for epoch in range(1, args.epochs + 1):
        classifier.partial_fit(X_train_scaled, y_train, classes=[0, 1])
        train_probability = classifier.predict_proba(X_train_scaled)[:, 1]
        valid_probability = classifier.predict_proba(X_valid_scaled)[:, 1]
        valid_prediction = (valid_probability >= 0.5).astype(int)
        current = {
            "train_log_loss": float(log_loss(y_train, train_probability)),
            "validation_log_loss": float(log_loss(y_valid, valid_probability)),
            "validation_accuracy": float(accuracy_score(y_valid, valid_prediction)),
            "validation_f1": float(f1_score(y_valid, valid_prediction)),
        }
        _report_epoch(logger, epoch, current)
        epoch_metrics.append({"epoch": epoch, **current})

    model = _export_model(scaler, classifier, args.model_output)
    final_metrics = epoch_metrics[-1]
    metrics_payload = {
        "training_parameters": params,
        "class_balance": {
            "on_track": int((y == 0).sum()),
            "needs_attention": int((y == 1).sum()),
        },
        "final_metrics": final_metrics,
        "epochs": epoch_metrics,
    }
    args.metrics_output.parent.mkdir(parents=True, exist_ok=True)
    args.metrics_output.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    if task:
        task.upload_artifact("synthetic_training_profiles", artifact_object=str(args.dataset))
        task.upload_artifact("spending_risk_model_json", artifact_object=str(args.model_output))
        task.upload_artifact("training_metrics_json", artifact_object=str(args.metrics_output))
        task.close()

    return {"model": model, "metrics": metrics_payload}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--model-output", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--metrics-output", type=Path, default=DEFAULT_METRICS)
    parser.add_argument("--epochs", type=int, default=24)
    parser.add_argument("--rows", type=int, default=240)
    parser.add_argument("--seed", type=int, default=20260522)
    parser.add_argument("--validation-size", type=float, default=0.25)
    parser.add_argument("--learning-rate", type=float, default=0.015)
    parser.add_argument("--alpha", type=float, default=0.0005)
    parser.add_argument(
        "--no-clearml",
        action="store_true",
        help="Train locally without creating a ClearML Task.",
    )
    args = parser.parse_args()

    result = train(args)
    final = result["metrics"]["final_metrics"]
    print(f"Model JSON: {args.model_output}")
    print(f"Metrics JSON: {args.metrics_output}")
    print(
        "Final validation metrics: "
        f"accuracy={final['validation_accuracy']:.3f}, "
        f"f1={final['validation_f1']:.3f}, "
        f"log_loss={final['validation_log_loss']:.3f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
