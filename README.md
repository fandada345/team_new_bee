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
- React dashboard connected to the FastAPI analysis API
- ClearML experiment entry point for SageMaker or local runs
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

`Request Handler -> Validation -> Data Processing -> Analytics -> Insight Generator -> Output`

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
      pipeline.py
    models/
      schemas.py
    utils/
      helpers.py
  data/
    showcase_transactions.csv
    sample_transactions.csv
    invalid_transactions.csv
    sample_response.json
    README.md
  frontend/
    package.json
    src/
    public/
  scripts/
    run_analysis.py
    run_clearml_experiment.py
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

ClearML is optional. Install it only when you want to run experiment tracking:

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

## Run a ClearML Experiment

ClearML experiment tracking is optional and kept separate from the normal API and CLI flow.

First install the optional dependency:

```bash
pip install -r requirements-clearml.txt
```

Then configure ClearML on your machine:

```bash
clearml-init
```

Run the sample experiment:

```bash
python scripts/run_clearml_experiment.py
```

The script loads `data/showcase_transactions.csv`, runs the existing analysis pipeline, logs these metrics to ClearML, and uploads the generated JSON output as an artifact:

- `total_transactions`
- `total_spend`
- `average_transaction`
- `number_of_insights`
- `number_of_anomalies`

If ClearML is not installed or not configured, the script exits gracefully and prints setup instructions.

## Classroom Demo Data

Use `data/showcase_transactions.csv` for the presentation. It is synthetic and designed to make the dashboard easy to explain:

- Repeated dining and coffee transactions highlight spending habits.
- Recurring subscriptions make fixed-cost reminders visible.
- A final-week laptop upgrade and dental emergency make trend and anomaly views stand out.
- Grocery, transport, utility, shopping, and other categories keep the dashboard realistic.

Use `data/invalid_transactions.csv` to demonstrate validation errors.

## GitHub To SageMaker

Before opening SageMaker, push this repository to GitHub without local environments or build artifacts. `.gitignore` already excludes `.venv`, `node_modules`, caches, generated JSON outputs, and frontend builds.

Inside SageMaker, clone the GitHub repository and run the backend or ClearML experiment from a terminal:

```bash
git clone <your-github-repo-url>
cd New_Bee_AI_Studio

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-clearml.txt

clearml-init
python scripts/run_clearml_experiment.py
```

The ClearML run records analysis metrics and uploads the JSON output artifact. The same repository can still be started as an API demo with:

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
  "metadata": {
    "pipeline": [
      "Request Handler",
      "Validation",
      "Data Processing",
      "Analytics",
      "Insight Generator",
      "Output"
    ]
  }
}
```

See [`data/sample_response.json`](/Users/fanenda/Desktop/New_Bee_AI_Studio/data/sample_response.json) for a fuller example payload.

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
python scripts/run_clearml_experiment.py
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
