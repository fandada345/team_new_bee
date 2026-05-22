# Demo Data

All CSV files in this folder are synthetic and safe to use for classroom demos.

`showcase_transactions.csv` is the presentation dataset. It is intentionally shaped to exercise the dashboard:

- Dining is frequent and expensive enough to create a strong spending-habit insight.
- Coffee, takeaway, and restaurant merchants repeat so the top-merchant views are clear.
- Subscription payments recur across three months.
- The final March week includes a laptop upgrade and a dental emergency so anomaly detection and the weekly trend visibly change.
- Groceries, transport, shopping, utilities, subscriptions, and other spending remain present so category charts look realistic.

Use `invalid_transactions.csv` when demonstrating CSV validation errors.

`spending_risk_training.csv` is a separate synthetic training table for the
SageMaker/ClearML classifier demo. Each row is a spending profile with category
shares, weekly spike ratio, merchant repetition, anomaly count, average
transaction size, and the binary `needs_attention` label.
