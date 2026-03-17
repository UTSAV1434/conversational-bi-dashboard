"""
Flask API - Main application for the Conversational BI Dashboard.
Supports any CSV dataset upload and natural language querying via Gemini.
"""

import os
import json
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from llm_engine import query_llm
from query_executor import execute_pandas_query, dataframe_to_chart_data

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Data store — holds whatever CSV the user has loaded
# ---------------------------------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global state for the currently loaded dataset
current_data = {
    "df": None,
    "filename": None,
    "schema_info": "",
    "sample_rows": "",
}


def load_dataset(filepath: str, filename: str):
    """Load a CSV file into the global data store."""
    df = pd.read_csv(filepath)
    current_data["df"] = df
    current_data["filename"] = filename

    # Build schema info string
    schema_lines = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        non_null = df[col].count()
        unique = df[col].nunique()
        schema_lines.append(f"  - {col} ({dtype}): {non_null} non-null, {unique} unique values")

        # Add sample values for categorical/string columns
        if df[col].dtype == "object" and unique <= 20:
            sample_vals = df[col].unique()[:10].tolist()
            schema_lines.append(f"    Sample values: {sample_vals}")

    current_data["schema_info"] = (
        f"Dataset: {filename}\n"
        f"Shape: {df.shape[0]} rows × {df.shape[1]} columns\n"
        f"Columns:\n" + "\n".join(schema_lines)
    )
    current_data["sample_rows"] = df.head(5).to_string(index=False)


# Load default sample dataset on startup
default_csv = os.path.join(DATA_DIR, "sample_sales_data.csv")
if os.path.exists(default_csv):
    load_dataset(default_csv, "sample_sales_data.csv")


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "dataset_loaded": current_data["df"] is not None,
        "dataset_name": current_data["filename"],
    })


@app.route("/api/schema", methods=["GET"])
def schema():
    if current_data["df"] is None:
        return jsonify({"error": "No dataset loaded. Please upload a CSV file."}), 400

    df = current_data["df"]
    columns = []
    for col in df.columns:
        col_info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "non_null_count": int(df[col].count()),
            "unique_count": int(df[col].nunique()),
        }
        if df[col].dtype == "object":
            col_info["sample_values"] = df[col].unique()[:10].tolist()
        elif df[col].dtype in ["int64", "float64"]:
            col_info["min"] = float(df[col].min())
            col_info["max"] = float(df[col].max())
            col_info["mean"] = round(float(df[col].mean()), 2)
        columns.append(col_info)

    return jsonify({
        "filename": current_data["filename"],
        "rows": int(df.shape[0]),
        "columns_count": int(df.shape[1]),
        "columns": columns,
    })


@app.route("/api/query", methods=["POST"])
def query():
    if current_data["df"] is None:
        return jsonify({"error": "No dataset loaded. Please upload a CSV file first."}), 400

    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' field in request body."}), 400

    user_query = data["query"].strip()
    if not user_query:
        return jsonify({"error": "Query cannot be empty."}), 400

    # Step 1: Ask Gemini to generate pandas code
    llm_response = query_llm(
        user_query,
        current_data["schema_info"],
        current_data["sample_rows"]
    )

    if "error" in llm_response:
        return jsonify({
            "error": llm_response["error"],
            "type": "llm_error"
        }), 200  # Still 200 — it's a valid response, just an error message

    # Step 2: Execute the pandas code
    try:
        result_df = execute_pandas_query(
            current_data["df"],
            llm_response.get("pandas_code", "")
        )
    except RuntimeError as e:
        return jsonify({
            "error": str(e),
            "type": "execution_error",
            "pandas_code": llm_response.get("pandas_code", ""),
        }), 200

    # Step 3: Convert to chart data
    x_column = llm_response.get("x_column", result_df.columns[0])
    y_columns = llm_response.get("y_columns", list(result_df.columns[1:]))

    try:
        chart_data, actual_y_columns = dataframe_to_chart_data(result_df, x_column, y_columns)
    except Exception as e:
        return jsonify({
            "error": f"Failed to format chart data: {str(e)}",
            "type": "format_error",
        }), 200

    return jsonify({
        "chart_data": chart_data,
        "chart_type": llm_response.get("chart_type", "bar"),
        "title": llm_response.get("title", "Query Result"),
        "summary": llm_response.get("summary", ""),
        "x_column": x_column,
        "y_columns": actual_y_columns,
        "rows_returned": len(chart_data),
    })


@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Please upload a CSV file."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported."}), 400

    # Save the file
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    file.save(filepath)

    # Load into memory
    try:
        load_dataset(filepath, file.filename)
    except Exception as e:
        return jsonify({"error": f"Failed to load CSV: {str(e)}"}), 400

    df = current_data["df"]
    return jsonify({
        "message": f"Successfully loaded '{file.filename}'",
        "filename": file.filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": list(df.columns),
    })


@app.route("/api/datasets", methods=["GET"])
def list_datasets():
    """List available datasets in the data directory."""
    datasets = []

    # Check data dir
    if os.path.exists(DATA_DIR):
        for f in os.listdir(DATA_DIR):
            if f.endswith(".csv"):
                datasets.append({"name": f, "source": "built-in"})

    # Check uploads dir
    if os.path.exists(UPLOAD_DIR):
        for f in os.listdir(UPLOAD_DIR):
            if f.endswith(".csv"):
                datasets.append({"name": f, "source": "uploaded"})

    return jsonify({
        "datasets": datasets,
        "current": current_data["filename"],
    })


@app.route("/api/datasets/load", methods=["POST"])
def load_existing_dataset():
    """Load an existing dataset by name."""
    data = request.get_json()
    if not data or "filename" not in data:
        return jsonify({"error": "Missing 'filename' field."}), 400

    filename = data["filename"]

    # Search in data dir first, then uploads
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        filepath = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(filepath):
            return jsonify({"error": f"File '{filename}' not found."}), 404

    try:
        load_dataset(filepath, filename)
    except Exception as e:
        return jsonify({"error": f"Failed to load: {str(e)}"}), 400

    df = current_data["df"]
    return jsonify({
        "message": f"Loaded '{filename}'",
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": list(df.columns),
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
