"""Run the Spend Insight AI pipeline and log a minimal ClearML experiment."""

from __future__ import annotations

import json
from pathlib import Path
import sys
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import configure_logging
from app.services.pipeline import analyze_transactions
from app.utils.helpers import load_csv_bytes


INPUT_CSV = PROJECT_ROOT / "data" / "sample_transactions.csv"
OUTPUT_JSON = PROJECT_ROOT / "data" / "clearml_experiment_output.json"


SETUP_INSTRUCTIONS = """
ClearML is not ready for this project yet.

To enable experiment tracking:

1. Install the optional ClearML dependency:
   pip install -r requirements-clearml.txt

2. Configure ClearML on this machine:
   clearml-init

   You can use a hosted ClearML server or your own ClearML server.
   The setup will create a ClearML config file with your API credentials.

3. Run the experiment again:
   python scripts/run_clearml_experiment.py
""".strip()


def _load_clearml_task() -> Any:
    try:
        from clearml import Task
    except ImportError as exc:
        raise RuntimeError(SETUP_INSTRUCTIONS) from exc

    try:
        return Task.init(
            project_name="Spend Insight AI",
            task_name="Sample CSV Analysis",
            reuse_last_task_id=False,
        )
    except Exception as exc:
        raise RuntimeError(SETUP_INSTRUCTIONS) from exc


def _extract_metrics(result: dict[str, Any]) -> dict[str, float | int]:
    summary = result["summary"]
    return {
        "total_transactions": int(summary["total_transactions"]),
        "total_spend": float(summary["total_spending"]),
        "average_transaction": float(summary["average_transaction"]),
        "number_of_insights": len(result["insights"]),
        "number_of_anomalies": len(result["anomalies"]),
    }


def main() -> int:
    configure_logging()

    try:
        task = _load_clearml_task()
    except RuntimeError as exc:
        print(exc)
        return 1

    file_bytes = INPUT_CSV.read_bytes()
    raw_df = load_csv_bytes(file_bytes)
    result = analyze_transactions(raw_df)

    OUTPUT_JSON.write_text(json.dumps(result, indent=2), encoding="utf-8")

    logger = task.get_logger()
    metrics = _extract_metrics(result)
    for metric_name, metric_value in metrics.items():
        logger.report_single_value(name=metric_name, value=metric_value)
        logger.report_scalar(
            title="analysis_metrics",
            series=metric_name,
            value=metric_value,
            iteration=0,
        )

    task.upload_artifact(
        name="analysis_output_json",
        artifact_object=str(OUTPUT_JSON),
    )
    task.close()

    print("ClearML experiment completed successfully.")
    print(f"Input CSV: {INPUT_CSV}")
    print(f"Output artifact source: {OUTPUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
