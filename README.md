# InsightAI — Conversational BI Dashboard

> Upload any CSV dataset and ask questions in plain English. Get interactive charts and insights instantly, powered by Google Gemini AI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Recharts |
| Backend | Python Flask |
| LLM | Google Gemini 2.0 Flash |
| Data | Pandas (any CSV) |

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
GEMINI_API_KEY=your_key_here
```

Start the server:
```bash
python app.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Features

- **Dataset Agnostic** — Upload any CSV file and start querying immediately
- **Natural Language Queries** — Ask questions in plain English, no SQL needed
- **Smart Chart Selection** — AI picks the best chart type (bar, line, pie, area, table)
- **Interactive Visualizations** — Tooltips, legends, animations via Recharts
- **Real-time Analysis** — Gemini generates pandas code, executes safely, returns results

## Sample Queries

- *"Show total revenue by region"*
- *"Monthly sales trend over time"*
- *"Compare profit margins across categories"*
- *"What are the top 10 products by revenue?"*

## Architecture

```
User → React Chat UI → Flask API → Gemini LLM → Pandas Query → JSON → Recharts Dashboard
```

## License

MIT
