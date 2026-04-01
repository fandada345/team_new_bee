# Spend Insight AI

Spend Insight AI is a lightweight FastAPI backend proof of concept that accepts personal spending transactions in CSV format, validates and cleans the data, runs explainable analytics, and returns rule-based financial insights as structured JSON.

This project is designed for a university demo and prioritizes speed of development, modularity, clarity, and easy GitHub setup over heavy infrastructure or machine learning complexity.

## Features

- CSV upload and local CLI ingestion
- Validation for required columns, empty files, invalid dates, and invalid amounts
- Data cleaning and preprocessing with duplicate removal and text normalization
- Dictionary-based category mapping into a fixed spending taxonomy
- Spending analytics for totals, category breakdown, trends, top merchants, and largest transactions
- Explainable anomaly detection using simple threshold rules
- Rule-based insight engine with titles, evidence, recommendations, and severity levels
- FastAPI JSON response ready for future frontend integration
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
    sample_transactions.csv
    invalid_transactions.csv
    sample_response.json
  scripts/
    run_analysis.py
  tests/
    test_validator.py
    test_cleaner.py
    test_analytics.py
    test_insight_engine.py
  requirements.txt
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

## Run the API

```bash
uvicorn app.main:app --reload
```

Once running, open:

- API root docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## Run the CLI

```bash
python scripts/run_analysis.py data/sample_transactions.csv --output data/output.json
```

## Run Tests

```bash
pytest
```

## API Usage

### Request

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/sample_transactions.csv"
```

### Response Shape

```json
{
  "summary": {
    "total_transactions": 30,
    "total_spending": 5546.06,
    "average_transaction": 184.87,
    "date_range": {
      "start": "2026-01-02",
      "end": "2026-02-28"
    }
  },
  "category_breakdown": [
    {
      "category": "Rent",
      "total_spending": 2900.0,
      "transaction_count": 2,
      "share_percentage": 52.29
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
      "title": "Rent is your highest spending category",
      "evidence": "You spent $2900.0 on Rent, which is 52.29% of total spending.",
      "recommendation": "Review your recent rent transactions and set a target reduction for the next month.",
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
