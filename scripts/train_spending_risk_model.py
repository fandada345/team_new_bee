"""Train the spending-risk profile model and report the run to ClearML."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any

import pandas as pd
from sklearn.linear_model import LogisticRegression
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
    classifier: SGDClassifier | LogisticRegression,
    model_path: Path,
    selected_model: dict[str, Any],
) -> dict[str, Any]:
    exported = {
        "model_type": "linear_profile_classifier",
        "selected_model": selected_model,
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


def _evaluate_classifier(
    classifier: SGDClassifier | LogisticRegression,
    X_train_scaled: Any,
    X_valid_scaled: Any,
    y_train: pd.Series,
    y_valid: pd.Series,
) -> dict[str, float]:
    train_probability = classifier.predict_proba(X_train_scaled)[:, 1]
    valid_probability = classifier.predict_proba(X_valid_scaled)[:, 1]
    valid_prediction = (valid_probability >= 0.5).astype(int)
    return {
        "train_log_loss": float(log_loss(y_train, train_probability)),
        "validation_log_loss": float(log_loss(y_valid, valid_probability)),
        "validation_accuracy": float(accuracy_score(y_valid, valid_prediction)),
        "validation_f1": float(f1_score(y_valid, valid_prediction)),
    }


def _candidate_grid(seed: int, epochs: int) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for alpha in [0.0002, 0.0005, 0.001]:
        for learning_rate in [0.01, 0.015, 0.025]:
            candidates.append(
                {
                    "family": "sgd_logistic",
                    "params": {
                        "alpha": alpha,
                        "eta0": learning_rate,
                        "max_iter": epochs,
                    },
                    "estimator": SGDClassifier(
                        loss="log_loss",
                        learning_rate="constant",
                        eta0=learning_rate,
                        alpha=alpha,
                        max_iter=epochs,
                        tol=None,
                        random_state=seed,
                    ),
                }
            )

    for regularization in [0.5, 1.0, 2.0]:
        candidates.append(
            {
                "family": "logistic_regression",
                "params": {"C": regularization, "solver": "lbfgs"},
                "estimator": LogisticRegression(
                    C=regularization,
                    solver="lbfgs",
                    max_iter=1000,
                    random_state=seed,
                ),
            }
        )
    return candidates


def _run_model_selection(
    logger: Any | None,
    X_train_scaled: Any,
    X_valid_scaled: Any,
    y_train: pd.Series,
    y_valid: pd.Series,
    seed: int,
    epochs: int,
) -> tuple[SGDClassifier | LogisticRegression, list[dict[str, Any]]]:
    results: list[dict[str, Any]] = []
    best_estimator: SGDClassifier | LogisticRegression | None = None

    for index, candidate in enumerate(_candidate_grid(seed, epochs), start=1):
        estimator = candidate["estimator"]
        estimator.fit(X_train_scaled, y_train)
        metrics = _evaluate_classifier(
            estimator,
            X_train_scaled,
            X_valid_scaled,
            y_train,
            y_valid,
        )
        result = {
            "rank_input": index,
            "family": candidate["family"],
            "params": candidate["params"],
            **metrics,
        }
        results.append(result)

        if logger is not None:
            logger.report_scalar(
                title="model_selection",
                series=f"{candidate['family']}_validation_f1",
                value=metrics["validation_f1"],
                iteration=index,
            )
            logger.report_scalar(
                title="model_selection",
                series=f"{candidate['family']}_validation_log_loss",
                value=metrics["validation_log_loss"],
                iteration=index,
            )

    results.sort(
        key=lambda item: (
            item["validation_f1"],
            item["validation_accuracy"],
            -item["validation_log_loss"],
        ),
        reverse=True,
    )
    for rank, result in enumerate(results, start=1):
        result["rank"] = rank

    selected = results[0]
    for candidate in _candidate_grid(seed, epochs):
        if (
            candidate["family"] == selected["family"]
            and candidate["params"] == selected["params"]
        ):
            best_estimator = candidate["estimator"]
            best_estimator.fit(X_train_scaled, y_train)
            break

    if best_estimator is None:  # pragma: no cover - defensive guard
        raise RuntimeError("Model selection did not produce an estimator.")

    return best_estimator, results


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
    baseline_classifier = SGDClassifier(
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
        baseline_classifier.partial_fit(X_train_scaled, y_train, classes=[0, 1])
        current = _evaluate_classifier(
            baseline_classifier,
            X_train_scaled,
            X_valid_scaled,
            y_train,
            y_valid,
        )
        _report_epoch(logger, epoch, current)
        epoch_metrics.append({"epoch": epoch, **current})

    selected_classifier, model_selection = _run_model_selection(
        logger,
        X_train_scaled,
        X_valid_scaled,
        y_train,
        y_valid,
        seed=args.seed,
        epochs=args.epochs,
    )
    final_metrics = {
        "selected_family": model_selection[0]["family"],
        "selected_params": model_selection[0]["params"],
        "validation_log_loss": model_selection[0]["validation_log_loss"],
        "validation_accuracy": model_selection[0]["validation_accuracy"],
        "validation_f1": model_selection[0]["validation_f1"],
    }
    model = _export_model(
        scaler,
        selected_classifier,
        args.model_output,
        selected_model={
            "family": model_selection[0]["family"],
            "params": model_selection[0]["params"],
            "validation_accuracy": model_selection[0]["validation_accuracy"],
            "validation_f1": model_selection[0]["validation_f1"],
            "validation_log_loss": model_selection[0]["validation_log_loss"],
        },
    )
    metrics_payload = {
        "training_parameters": params,
        "class_balance": {
            "on_track": int((y == 0).sum()),
            "needs_attention": int((y == 1).sum()),
        },
        "final_metrics": final_metrics,
        "epochs": epoch_metrics,
        "model_selection": model_selection,
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
    print(
        "Selected model: "
        f"{final['selected_family']} {json.dumps(final['selected_params'], sort_keys=True)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
