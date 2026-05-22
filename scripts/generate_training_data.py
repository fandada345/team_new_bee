"""Create deterministic synthetic profile rows for spending-risk training."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
import random
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.services.risk_features import FEATURE_NAMES


DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "spending_risk_training.csv"


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(value, upper))


def _profile_row(rng: random.Random, index: int) -> dict[str, float | int]:
    cautious = index % 2 == 0
    event_spend = index % 5 == 0

    shopping_share = rng.uniform(6, 28) if cautious else rng.uniform(18, 58)
    dining_share = rng.uniform(5, 22) if cautious else rng.uniform(12, 42)
    subscriptions_share = rng.uniform(2, 9) if cautious else rng.uniform(4, 18)
    weekly_spike_ratio = rng.uniform(0.7, 1.25) if cautious else rng.uniform(0.9, 2.8)
    repeat_merchant_ratio = rng.uniform(0.04, 0.18) if cautious else rng.uniform(0.12, 0.42)
    anomaly_count = rng.choice([0, 0, 1]) if cautious else rng.choice([0, 1, 1, 2, 3])
    average_transaction = rng.uniform(18, 72) if cautious else rng.uniform(45, 185)

    if event_spend:
        weekly_spike_ratio += rng.uniform(0.45, 1.1)
        anomaly_count += 1
        average_transaction += rng.uniform(25, 95)

    score = (
        shopping_share * 0.038
        + dining_share * 0.028
        + subscriptions_share * 0.02
        + weekly_spike_ratio * 0.72
        + repeat_merchant_ratio * 2.25
        + anomaly_count * 0.45
        + average_transaction * 0.008
        + rng.uniform(-0.55, 0.55)
    )
    needs_attention = int(score >= 3.15)

    return {
        "shopping_share": round(_clamp(shopping_share, 0, 100), 2),
        "dining_share": round(_clamp(dining_share, 0, 100), 2),
        "subscriptions_share": round(_clamp(subscriptions_share, 0, 100), 2),
        "weekly_spike_ratio": round(_clamp(weekly_spike_ratio, 0.2, 5), 2),
        "repeat_merchant_ratio": round(_clamp(repeat_merchant_ratio, 0, 1), 3),
        "anomaly_count": anomaly_count,
        "average_transaction": round(_clamp(average_transaction, 1, 400), 2),
        "needs_attention": needs_attention,
    }


def write_training_data(output_path: Path, rows: int, seed: int) -> None:
    rng = random.Random(seed)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=[*FEATURE_NAMES, "needs_attention"])
        writer.writeheader()
        writer.writerows(_profile_row(rng, index) for index in range(rows))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--rows", type=int, default=240)
    parser.add_argument("--seed", type=int, default=20260522)
    args = parser.parse_args()

    write_training_data(args.output, args.rows, args.seed)
    print(f"Wrote {args.rows} synthetic training rows to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
