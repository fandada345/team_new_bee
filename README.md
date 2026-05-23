# Spend Insight AI

Spend Insight AI is a university demo project for personal spending analysis. Users upload transaction CSV files, the FastAPI backend validates and cleans the data, and the React dashboard shows spending totals, category breakdowns, trends, anomalies, and explainable recommendations.

The repository is organized so it can be pushed to GitHub first and cloned into AWS SageMaker for ClearML-tracked experiment runs.

## Features

- CSV upload and local CLI ingestion
- Validation for required columns, empty files, invalid dates, and invalid amounts
- Data cleaning and preprocessing with duplicate removal and text normalization
- Dictionary-based category mapping into a fixed spending taxonomy
- Spending analytics for totals, category breakdown, trends, top merchants, and largest transactions
- Explainable anomaly detection for unusual large transactions
- Rule-based insight engine with titles, evidence, recommendations, and severity levels
- Trained spending-risk profile model that scores an uploaded analysis for attention risk
- React dashboard connected to the FastAPI analysis API
- SageMaker-ready training script with per-epoch ClearML loss, accuracy, and F1 tracking
- Hyperparameter tuning and model selection across SGD logistic and Logistic Regression candidates
- GitHub Actions CI for backend tests, training smoke test, frontend lint, and frontend build
- Pytest unit tests

## Fixed Taxonomy

- Groceries
- Dining
- Transport
- Rent
- Utilities
- Subscriptions
- Shopping
- Other

## Architecture

The backend follows this flow:

`Request Handler -> Validation -> Data Processing -> Analytics -> Insight Generator -> Risk Model -> Output`

The dashboard uses deterministic analytics and insights for explainability. A separate
small classifier is trained on synthetic spending profiles and exported as
`models/spending_risk_model.json`, so API inference stays lightweight while the
training process can be demonstrated in SageMaker and ClearML.

## Project Structure

```text
spend-insight-ai/
  app/
    main.py
    api/
      routes.py
    core/
      config.py
    services/
      validator.py
      cleaner.py
      category_mapper.py
      analytics.py
      insight_engine.py
      risk_features.py
      risk_model.py
      pipeline.py
    models/
      schemas.py
    utils/
      helpers.py
  data/
    showcase_transactions.csv
    spending_risk_training.csv
    sample_transactions.csv
    invalid_transactions.csv
    sample_response.json
    README.md
  frontend/
    package.json
    src/
    public/
  scripts/
    generate_training_data.py
    train_spending_risk_model.py
    run_analysis.py
    run_clearml_experiment.py
  models/
    spending_risk_model.json
    spending_risk_metrics.json
  tests/
    test_validator.py
    test_cleaner.py
    test_analytics.py
    test_insight_engine.py
  requirements.txt
  requirements-clearml.txt
  README.md
  .gitignore
```

## Setup

### 1. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Install the training dependencies before SageMaker/ClearML model training:

```bash
pip install -r requirements-clearml.txt
```

## Run the API

```bash
uvicorn app.main:app --reload
```

Once running, open:

- API root docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## Run the CLI

```bash
python scripts/run_analysis.py data/showcase_transactions.csv --output data/output.json
```

## Run the Frontend Dashboard

Start the FastAPI backend first:

```bash
uvicorn app.main:app --reload
```

Install the React frontend dependencies once and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The dev server proxies `/analyze` to the FastAPI backend.

For a single backend-served dashboard, build the frontend and then open the FastAPI root:

```bash
cd frontend
npm run build
```

Once `frontend/dist` exists, FastAPI serves the built dashboard at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Run Tests

```bash
pytest
```

## CI/CD

GitHub Actions runs on pushes and pull requests to `main`:

- Backend job: installs Python dependencies, runs `pytest`, and runs `python scripts/train_spending_risk_model.py --no-clearml`.
- Frontend job: installs Node dependencies, runs `npm run lint`, and runs `npm run build`.

The workflow file is `.github/workflows/ci.yml`.

## Train the AI Model with ClearML

The primary AI workflow trains a small spending-risk profile classifier. This is
the classroom training run to show in SageMaker and ClearML.

Install and configure ClearML:

```bash
pip install -r requirements-clearml.txt
```

Then configure ClearML on your machine:

```bash
clearml-init
```

Train the model:

```bash
python scripts/train_spending_risk_model.py
```

The training script loads `data/spending_risk_training.csv`, splits training and
validation profiles, trains for 24 epochs, and reports these per-epoch baseline
scalars to ClearML:

- `train_log_loss`
- `validation_log_loss`
- `validation_accuracy`
- `validation_f1`

It also runs model selection over multiple candidates:

- SGD Logistic classifiers with different `alpha` and `eta0` values.
- Logistic Regression classifiers with different `C` values.

The selected model is chosen by validation F1, validation accuracy, and validation
log loss. The model selection scores are reported to ClearML under
`model_selection`, and the full ranking is saved in
`models/spending_risk_metrics.json`.

The script uploads the synthetic profile dataset,
`models/spending_risk_model.json`, and `models/spending_risk_metrics.json` as
ClearML artifacts. The exported JSON model is used by the API `risk_assessment`
response and the frontend Insights page.

For a local smoke test without creating a ClearML Task:

```bash
python scripts/train_spending_risk_model.py --no-clearml
```

`scripts/run_clearml_experiment.py` remains available as a secondary analysis
tracking demo, but it does not train a model.

## Classroom Demo Data

Use `data/showcase_transactions.csv` for the presentation. It is synthetic and designed to make the dashboard easy to explain:

- Repeated dining and coffee transactions highlight spending habits.
- Recurring subscriptions make fixed-cost reminders visible.
- A final-week laptop upgrade and dental emergency make trend and anomaly views stand out.
- Grocery, transport, utility, shopping, and other categories keep the dashboard realistic.

Use `data/invalid_transactions.csv` to demonstrate validation errors.

`data/spending_risk_training.csv` is a separate synthetic profile dataset for the
model training run. Regenerate it with:

```bash
python scripts/generate_training_data.py
```

## GitHub To SageMaker

Before opening SageMaker, push this repository to GitHub without local environments or build artifacts. `.gitignore` already excludes `.venv`, `node_modules`, caches, generated JSON outputs, and frontend builds.

Inside SageMaker, clone the GitHub repository and run the ClearML training job
from a terminal:

```bash
git clone <your-github-repo-url>
cd New_Bee_AI_Studio

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-clearml.txt

clearml-init
python scripts/train_spending_risk_model.py
```

In ClearML, open the training Task to show scalar curves for loss, validation
accuracy, validation F1, model-selection scores, plus the exported
dataset/model/metrics artifacts.
The same repository can still be started as an API demo with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Usage

### Request

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/showcase_transactions.csv"
```

### Response Shape

```json
{
  "summary": {
    "total_transactions": 89,
    "total_spending": 7583.53,
    "average_transaction": 85.21,
    "date_range": {
      "start": "2026-01-02",
      "end": "2026-03-31"
    }
  },
  "category_breakdown": [
    {
      "category": "Shopping",
      "total_spending": 2734.8,
      "transaction_count": 10,
      "share_percentage": 36.06
    }
  ],
  "trends": {
    "weekly": [],
    "monthly": []
  },
  "top_merchants": [],
  "largest_transactions": [],
  "anomalies": [],
  "insights": [
    {
      "title": "Shopping is your highest spending category",
      "evidence": "You spent $2734.8 on Shopping, which is 36.06% of total spending.",
      "recommendation": "Review your recent shopping transactions and set a target reduction for the next month.",
      "severity": "high"
    }
  ],
  "risk_assessment": {
    "status": "trained_model",
    "label": "Needs attention",
    "probability": 0.99,
    "severity": "high",
    "summary": "The trained profile model sees a higher-risk mix of discretionary spending, weekly spikes, repeated merchants, or anomalies.",
    "features": {
      "shopping_share": 36.06,
      "weekly_spike_ratio": 2.43
    }
  },
  "metadata": {
    "pipeline": [
      "Request Handler",
      "Validation",
      "Data Processing",
      "Analytics",
      "Insight Generator",
      "Risk Model",
      "Output"
    ]
  }
}
```

See [`data/sample_response.json`](data/sample_response.json) for a fuller example payload.

## Validation Rules

- Required columns: `date`, `category`, `amount`
- Empty CSVs are rejected
- Invalid date formats are rejected with row-level hints
- Invalid amount formats are rejected with row-level hints

## Cleaning Assumptions

- Column names are normalized to lowercase
- Missing `merchant` values are replaced with `Unknown Merchant`
- Invalid or missing required parsed values are dropped during cleaning after validation
- Negative amounts are converted to absolute values so the POC consistently treats them as spending amounts
- Duplicate rows are removed

## Local Commands

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest
python scripts/run_analysis.py data/showcase_transactions.csv --output data/output.json
cd frontend
npm install
npm run dev
npm run build
pip install -r requirements-clearml.txt
clearml-init
python scripts/train_spending_risk_model.py
```

## GitHub Workflow

```bash
git init
git add .
git commit -m "Initial Spend Insight AI backend POC"
git branch -M main
git remote add origin https://github.com/<your-username>/spend-insight-ai.git
git push -u origin main
```

## Notes

- The insight engine is intentionally deterministic and explainable.
- The category mapping dictionary can be extended quickly for new raw labels.
- The CLI lets you demo the full backend pipeline without a frontend.
