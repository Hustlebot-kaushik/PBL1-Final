import sqlite3

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

from db_config import DB_PATH
from yoochoose_pipeline import FEATURES, build_feature_frame, load_yoochoose_sessions

app = Flask(__name__)
CORS(app)

artifact = joblib.load("friction_model.pkl")
model = artifact["model"]
le = artifact["encoder"]


def query(sql, params=None):
    with sqlite3.connect(DB_PATH) as conn:
        return pd.read_sql_query(sql, conn, params=params)


def ensure_prediction_table():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS session_model_predictions (
                session_id INTEGER PRIMARY KEY,
                friction_level TEXT NOT NULL,
                friction_score REAL NOT NULL,
                low_probability REAL NOT NULL,
                medium_probability REAL NOT NULL,
                high_probability REAL NOT NULL,
                predicted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


ensure_prediction_table()


@app.route("/api/friction/summary")
def friction_summary():
    df = query("""
        SELECT
            smp.friction_level,
            COUNT(*) AS sessions,
            ROUND(AVG(smp.friction_score), 4) AS avg_score
        FROM session_model_predictions smp
        GROUP BY smp.friction_level
        ORDER BY CASE smp.friction_level
            WHEN 'Low' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'High' THEN 3
            ELSE 4
        END
    """)
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/kpis")
def kpis():
    df = query("""
        SELECT
            COUNT(*) AS total_sessions,
            COUNT(DISTINCT sa.user_id) AS total_users,
            ROUND(SUM(CASE WHEN sa.purchase_count > 0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS conversion_rate,
            ROUND(AVG(sa.dwell_time), 0) AS avg_session_duration,
            ROUND(COALESCE(ev.total_errors, 0) * 100.0 / NULLIF(COALESCE(ev.total_events, 0), 0), 2) AS error_rate
        FROM session_analytics sa
        CROSS JOIN (
            SELECT
                SUM(COALESCE(error_flag, 0)) AS total_errors,
                COUNT(*) AS total_events
            FROM events
        ) ev
    """)
    return jsonify(df.to_dict(orient="records")[0])


@app.route("/api/trend")
def trend():
    days = request.args.get("days", 14, type=int)
    df = query("""
        SELECT
            DATE(sa.timestamp) AS day,
            smp.friction_level,
            COUNT(*) AS sessions
        FROM session_analytics sa
        JOIN session_model_predictions smp ON sa.id = smp.session_id
        WHERE DATE(sa.timestamp) >= DATE((SELECT MAX(timestamp) FROM session_analytics), ?)
        GROUP BY DATE(sa.timestamp), smp.friction_level
        ORDER BY day
    """, [f"-{days} days"])
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/funnel")
def funnel():
    df = query("""
        SELECT
            COUNT(*) AS total_sessions,
            SUM(CASE WHEN total_clicks >= 1 THEN 1 ELSE 0 END) AS browsing_sessions,
            SUM(CASE WHEN page_switch_count >= 2 THEN 1 ELSE 0 END) AS engaged_sessions,
            SUM(CASE WHEN purchase_count > 0 THEN 1 ELSE 0 END) AS purchase_sessions
        FROM session_analytics
    """)
    row = df.to_dict(orient="records")[0]
    total = max(int(row["total_sessions"]), 1)
    result = [
        {"stage": "Sessions", "count": int(row["total_sessions"]), "pct": round(int(row["total_sessions"]) / total * 100, 1)},
        {"stage": "Browsing", "count": int(row["browsing_sessions"]), "pct": round(int(row["browsing_sessions"]) / total * 100, 1)},
        {"stage": "Engaged", "count": int(row["engaged_sessions"]), "pct": round(int(row["engaged_sessions"]) / total * 100, 1)},
        {"stage": "Purchase", "count": int(row["purchase_sessions"]), "pct": round(int(row["purchase_sessions"]) / total * 100, 1)},
    ]
    return jsonify(result)


@app.route("/api/sessions")
def sessions():
    limit = request.args.get("limit", 50, type=int)
    friction = request.args.get("friction", "all")
    device = request.args.get("device", "all")

    where = ["1=1"]
    params = []

    if friction != "all":
        where.append("smp.friction_level = ?")
        params.append(friction)
    if device != "all":
        where.append("LOWER(sa.device_type) = LOWER(?)")
        params.append(device)

    params.append(limit)
    df = query(f"""
        SELECT
            sa.id AS session_id,
            sa.user_id,
            sa.device_type,
            sa.browser,
            sa.dwell_time AS session_duration,
            smp.friction_level,
            ROUND(smp.friction_score, 4) AS friction_score,
            sa.total_clicks AS total_events,
            COALESCE(pr.revenue, 0) AS revenue
        FROM session_analytics sa
        JOIN session_model_predictions smp ON sa.id = smp.session_id
        LEFT JOIN (
            SELECT
                session_id,
                SUM(price * quantity) AS revenue
            FROM purchases
            GROUP BY session_id
        ) pr ON sa.id = pr.session_id
        WHERE {' AND '.join(where)}
        ORDER BY smp.friction_score DESC
        LIMIT ?
    """, params)
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/devices")
def devices():
    df = query("""
        SELECT
            COALESCE(NULLIF(sa.device_type, ''), 'unknown') AS device_type,
            smp.friction_level,
            COUNT(*) AS sessions
        FROM session_analytics sa
        JOIN session_model_predictions smp ON sa.id = smp.session_id
        GROUP BY COALESCE(NULLIF(sa.device_type, ''), 'unknown'), smp.friction_level
        ORDER BY device_type
    """)
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/predict/live", methods=["POST"])
def predict_live():
    data = request.get_json() or {}
    session_id = data.get("session_id")

    with sqlite3.connect(DB_PATH) as conn:
        raw_df = load_yoochoose_sessions(conn)

    raw_df = raw_df[raw_df["session_id"] == session_id]
    if raw_df.empty:
        return jsonify({"error": f"Session {session_id} not found"}), 404

    df = build_feature_frame(raw_df, artifact=artifact)
    probas = model.predict_proba(df[FEATURES])
    pred_enc = np.argmax(probas, axis=1)
    friction_level = le.inverse_transform(pred_enc)[0]
    friction_score = float((1 - probas.max(axis=1))[0])
    class_probs = {
        label: round(float(prob), 4)
        for label, prob in zip(le.classes_, probas[0])
    }

    return jsonify({
        "session_id": int(session_id),
        "friction_level": friction_level,
        "friction_score": round(friction_score, 4),
        "probabilities": class_probs,
    })


@app.route("/api/errors")
def errors():
    df = query("""
        SELECT
            smp.friction_level,
            ROUND(SUM(COALESCE(e.error_flag, 0)) * 100.0 / NULLIF(COUNT(e.event_id), 0), 2) AS error_rate,
            SUM(COALESCE(e.error_flag, 0)) AS total_errors,
            COUNT(e.event_id) AS total_events
        FROM session_model_predictions smp
        JOIN events e ON smp.session_id = e.session_id
        GROUP BY smp.friction_level
        ORDER BY CASE smp.friction_level
            WHEN 'Low' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'High' THEN 3
            ELSE 4
        END
    """)
    return jsonify(df.to_dict(orient="records"))


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
