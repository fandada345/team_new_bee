"""CLI entry point for running Spend Insight AI without a frontend."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import configure_logging
from app.services.pipeline import analyze_transactions
from app.utils.helpers import load_csv_bytes


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze transaction CSV files.")
    parser.add_argument("input_csv", help="Path to the input CSV file")
    parser.add_argument(
        "--output",
        default="data/output.json",
        help="Path to write the JSON output",
    )
    return parser.parse_args()


def main() -> None:
    configure_logging()
    args = parse_args()

    input_path = Path(args.input_csv)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    file_bytes = input_path.read_bytes()
    raw_df = load_csv_bytes(file_bytes)
    result = analyze_transactions(raw_df)

    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Analysis complete. JSON written to {output_path}")


if __name__ == "__main__":
    main()
