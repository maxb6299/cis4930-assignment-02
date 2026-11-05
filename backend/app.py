# Some code in this file was generated using AI

from flask import Flask, jsonify
from flask_cors import CORS

import os
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # the frontend dev server is a different origin


def load_data():
    DATA_PATH = os.path.join(
        os.path.dirname(__file__), "data/clean_memory_retirement.csv"
    )

    df = pd.read_csv(DATA_PATH)

    # Replace NaNs with None so it serializes to valid JSON nulls
    df_records = df.replace({np.nan: None}).to_dict(orient="records")

    return df_records


@app.route("/api/data", methods=["GET"])
def get_records():
    """Serves the full cleaned records to the browser on load."""
    df_records = load_data()
    try:
        return jsonify(
            {"status": "success", "total": len(df_records), "data": df_records}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
