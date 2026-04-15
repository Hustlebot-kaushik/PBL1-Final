import json
import os
import sqlite3
from datetime import datetime, timezone

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
feature_importance_map = {
    feature: float(importance)
    for feature, importance in zip(FEATURES, getattr(model, "feature_importances_", np.repeat(1 / len(FEATURES), len(FEATURES))))
}
benchmark_cache = None

RISK_SIGNAL_CONFIG = {
    "retry_ratio": {
        "label": "Repeat attempts",
        "benchmark_key": "retry_75",
        "direction": "high",
        "why": "Users are repeating actions more often than expected.",
        "action": "Review the step that causes retries and simplify validation or CTA wording.",
    },
    "backtrack_ratio": {
        "label": "Backtracking",
        "benchmark_key": "back_75",
        "direction": "high",
        "why": "Users are navigating backward more than the benchmark.",
        "action": "Improve page hierarchy and add clearer next-step guidance.",
    },
    "dwell_per_click": {
        "label": "Slow progress",
        "benchmark_key": "dwell_75",
        "direction": "high",
        "why": "Users spend too long between meaningful interactions.",
        "action": "Shorten content density and surface the most likely next action earlier.",
    },
    "switch_ratio": {
        "label": "Context switching",
        "benchmark_key": "switch_75",
        "direction": "high",
        "why": "Users are switching pages frequently without closing the journey.",
        "action": "Reduce decision overload and highlight the primary path.",
    },
    "error_rate": {
        "label": "Error pressure",
        "benchmark_key": "error_75",
        "direction": "high",
        "why": "Errors are occurring at a higher rate than normal.",
        "action": "Instrument the failing interaction and harden error handling.",
    },
    "search_ratio": {
        "label": "Search dependency",
        "benchmark_key": "search_75",
        "direction": "high",
        "why": "Users rely on search heavily, which can indicate navigation friction.",
        "action": "Improve information scent on landing, category, and product pages.",
    },
    "screen_variety": {
        "label": "Journey sprawl",
        "benchmark_key": "screen_75",
        "direction": "high",
        "why": "The session touches too many screens for the amount of progress made.",
        "action": "Reduce branching and make key flows more direct.",
    },
    "purchase_count": {
        "label": "No conversion signal",
        "benchmark": 1,
        "direction": "low",
        "why": "The journey has not produced a purchase signal yet.",
        "action": "Strengthen trust, urgency, and checkout continuity.",
    },
    "revenue": {
        "label": "No revenue captured",
        "benchmark": 1,
        "direction": "low",
        "why": "The session has not produced revenue despite active behavior.",
        "action": "Surface pricing clarity, payment reassurance, and offer reminders.",
    },
}


def query(sql, params=None):
    with sqlite3.connect(DB_PATH) as conn:
        return pd.read_sql_query(sql, conn, params=params)


def query_or_empty(sql, params=None, columns=None):
    try:
        return query(sql, params=params)
    except (sqlite3.Error, pd.errors.DatabaseError):
        return pd.DataFrame(columns=columns or [])


def table_exists(name):
    df = query_or_empty(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        [name],
        ["name"],
    )
    return not df.empty


def ensure_prediction_table():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS session_model_predictions (
                session_id INTEGER PRIMARY KEY,
                friction_level TEXT NOT NULL,
                friction_score REAL NOT NULL,
                low_probability REAL NOT NULL,
                medium_probability REAL NOT NULL,
                high_probability REAL NOT NULL,
                predicted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def ensure_live_tables():
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS live_event_stream (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                user_id TEXT,
                event_type TEXT NOT NULL,
                page_name TEXT,
                event_time TEXT NOT NULL,
                device_type TEXT,
                browser TEXT,
                error_flag INTEGER NOT NULL DEFAULT 0,
                amount REAL NOT NULL DEFAULT 0,
                metadata TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_live_event_stream_session ON live_event_stream(session_id);
            CREATE INDEX IF NOT EXISTS idx_live_event_stream_time ON live_event_stream(event_time);
            """
        )
        conn.commit()


ensure_prediction_table()
ensure_live_tables()


def load_historical_model_frame(conn):
    try:
        return load_yoochoose_sessions(conn)
    except (sqlite3.Error, pd.errors.DatabaseError):
        return pd.DataFrame()


def load_live_model_frame(conn, session_id=None):
    where = ""
    params = []
    if session_id is not None:
        where = "WHERE session_id = ?"
        params.append(session_id)

    sql = f"""
        SELECT
            session_id,
            COALESCE(MAX(user_id), CAST(session_id AS TEXT)) AS user_id,
            COALESCE(MAX(NULLIF(device_type, '')), 'web') AS device_type,
            COALESCE(MAX(NULLIF(browser, '')), 'unknown') AS browser,
            MAX(event_time) AS timestamp,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) IN ('click', 'tap', 'product_view', 'page_view', 'scroll') THEN 1 ELSE 0 END) AS total_clicks,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) IN ('back', 'back_click', 'backtrack') THEN 1 ELSE 0 END) AS back_clicks,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) IN ('retry', 'form_retry', 'error_retry') THEN 1 ELSE 0 END) AS retry_count,
            CAST(
                CASE
                    WHEN MAX((julianday(event_time) - julianday(first_event_time)) * 86400) > 0
                    THEN MAX((julianday(event_time) - julianday(first_event_time)) * 86400)
                    ELSE 0
                END AS INTEGER
            ) AS dwell_time,
            CASE
                WHEN COUNT(DISTINCT COALESCE(page_name, 'unknown')) > 0 THEN COUNT(DISTINCT COALESCE(page_name, 'unknown')) - 1
                ELSE 0
            END AS page_switch_count,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) = 'purchase' THEN 1 ELSE 0 END) AS purchase_count,
            SUM(COALESCE(error_flag, 0)) AS total_errors,
            COUNT(DISTINCT COALESCE(page_name, 'unknown')) AS unique_screens,
            COUNT(DISTINCT LOWER(COALESCE(event_type, 'unknown'))) AS distinct_event_types,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) IN ('checkout', 'payment', 'purchase') THEN 1 ELSE 0 END) AS checkout_events,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) = 'search' THEN 1 ELSE 0 END) AS search_events,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) = 'purchase' THEN COALESCE(amount, 0) ELSE 0 END) AS revenue,
            'guest' AS user_type
        FROM (
            SELECT
                *,
                MIN(event_time) OVER (PARTITION BY session_id) AS first_event_time
            FROM live_event_stream
            {where}
        )
        GROUP BY session_id
        ORDER BY MAX(event_time) DESC
    """
    try:
        return pd.read_sql_query(sql, conn, params=params)
    except (sqlite3.Error, pd.errors.DatabaseError):
        return pd.DataFrame()


def get_benchmark_stats():
    global benchmark_cache
    if benchmark_cache is not None:
        return benchmark_cache

    frames = []
    with sqlite3.connect(DB_PATH) as conn:
        historical = load_historical_model_frame(conn)
        if not historical.empty:
            frames.append(build_feature_frame(historical, artifact=artifact))
        live_frame = load_live_model_frame(conn)
        if not live_frame.empty:
            frames.append(build_feature_frame(live_frame, artifact=artifact))

    if frames:
        combined = pd.concat(frames, ignore_index=True)
        medians = combined[FEATURES].median(numeric_only=True).fillna(0).to_dict()
        stds = combined[FEATURES].std(numeric_only=True).replace(0, 1).fillna(1).to_dict()
    else:
        medians = {feature: 0 for feature in FEATURES}
        stds = {feature: 1 for feature in FEATURES}

    benchmark_cache = {
        "medians": medians,
        "stds": stds,
        "thresholds": artifact.get("thresholds", {}),
    }
    return benchmark_cache


def score_frame(frame):
    if frame.empty:
        return pd.DataFrame()

    engineered = build_feature_frame(frame, artifact=artifact).copy()
    probabilities = model.predict_proba(engineered[FEATURES])
    encoded_predictions = np.argmax(probabilities, axis=1)
    engineered["model_level"] = le.inverse_transform(encoded_predictions)
    
    for index, label in enumerate(le.classes_):
        engineered[f"{label.lower()}_probability"] = probabilities[:, index].round(4)
        
    # Base model score (0 to 1) from class probabilities.
    model_score = (
        engineered.get("high_probability", 0) * 1.0 +
        engineered.get("medium_probability", 0) * 0.5
    )

    # Rule calibration: promote obvious struggling sessions that the model marks too low.
    thresholds = artifact.get("thresholds", {})
    retry_75 = float(thresholds.get("retry_75", 0))
    back_75 = float(thresholds.get("back_75", 0))
    dwell_75 = float(thresholds.get("dwell_75", 0))
    switch_75 = float(thresholds.get("switch_75", 0))
    error_75 = float(thresholds.get("error_75", 0))
    search_75 = float(thresholds.get("search_75", 0))
    screen_75 = float(thresholds.get("screen_75", 0))

    # Research-informed calibration:
    # - Repeated unsuccessful actions and errors are strong frustration signals.
    # - High effort alone can also indicate engagement, so effort is paired with failure/no-conversion context.
    no_purchase = (engineered["purchase_count"] <= 0) & (engineered["revenue"] <= 0)

    risk_points = pd.Series(np.zeros(len(engineered), dtype=float), index=engineered.index)

    # Relative pressure from the training quantiles.
    risk_points += (engineered["retry_ratio"] > retry_75).astype(float) * 1.5
    risk_points += (engineered["backtrack_ratio"] > back_75).astype(float) * 1.25
    risk_points += (engineered["dwell_per_click"] > dwell_75).astype(float) * 1.0
    risk_points += (engineered["switch_ratio"] > switch_75).astype(float) * 0.75
    risk_points += (engineered["error_rate"] > error_75).astype(float) * 1.5
    risk_points += ((engineered["search_ratio"] > search_75) & no_purchase).astype(float) * 0.75
    risk_points += ((engineered["screen_variety"] > screen_75) & no_purchase).astype(float) * 0.5

    # Absolute signals to avoid requiring extreme behavior in live demos.
    risk_points += (engineered["total_errors"] >= 2).astype(float) * 1.0
    risk_points += (engineered["total_errors"] >= 5).astype(float) * 1.5
    risk_points += (engineered["retry_count"] >= 2).astype(float) * 1.0
    risk_points += (engineered["retry_count"] >= 4).astype(float) * 1.5
    risk_points += (engineered["back_clicks"] >= 2).astype(float) * 1.0
    risk_points += ((engineered["search_events"] >= 3) & no_purchase).astype(float) * 1.0

    # Checkout abandonment pressure: repeated checkout without purchase should escalate quickly.
    risk_points += ((engineered["checkout_events"] >= 1) & no_purchase).astype(float) * 1.0
    risk_points += ((engineered["checkout_events"] >= 2) & no_purchase).astype(float) * 1.5
    risk_points += (
        (engineered["checkout_events"] >= 3)
        & no_purchase
        & (engineered["total_clicks"] >= 25)
    ).astype(float) * 1.5

    # Prolonged no-conversion sessions are likely frustrating after sustained effort.
    risk_points += ((engineered["dwell_time"] >= 180) & no_purchase).astype(float) * 1.0
    risk_points += ((engineered["dwell_time"] >= 420) & no_purchase).astype(float) * 1.0
    risk_points += ((engineered["total_clicks"] >= 40) & no_purchase).astype(float) * 1.0
    risk_points += ((engineered["total_clicks"] >= 90) & no_purchase).astype(float) * 1.0
    risk_points += (
        (engineered["total_clicks"] >= 100)
        & (engineered["checkout_events"] >= 1)
        & no_purchase
    ).astype(float) * 1.0

    # Successful conversion should de-escalate friction.
    risk_points -= ((engineered["purchase_count"] > 0) | (engineered["revenue"] > 0)).astype(float) * 3.0
    risk_points = risk_points.clip(lower=0.0)
    engineered["risk_points"] = risk_points

    rule_level = pd.Series("Low", index=engineered.index)
    rule_level[risk_points >= 2.5] = "Medium"
    rule_level[risk_points >= 5.0] = "High"

    # Conversion should reduce friction, but not erase prior struggle in one jump.
    # If a session shows clear pre-conversion struggle, keep at least Medium after purchase.
    has_conversion = (engineered["purchase_count"] > 0) | (engineered["revenue"] > 0)
    struggled_before_conversion = has_conversion & (
        (engineered["checkout_events"] >= 2)
        | (engineered["total_errors"] >= 2)
        | (engineered["retry_count"] >= 2)
        | (engineered["back_clicks"] >= 2)
        | (engineered["total_clicks"] >= 80)
    )
    rule_level[(rule_level == "Low") & struggled_before_conversion] = "Medium"

    severity = {"Low": 1, "Medium": 2, "High": 3}
    engineered["friction_level"] = np.where(
        rule_level.map(severity) > engineered["model_level"].map(severity),
        rule_level,
        engineered["model_level"],
    )

    # Final score blends model confidence with calibrated rule pressure.
    rule_score = (risk_points / 7.0).clip(0, 1)
    engineered["friction_score"] = np.maximum(model_score, rule_score).round(4)

    return engineered


def get_live_scored_frame(session_id=None):
    with sqlite3.connect(DB_PATH) as conn:
        live_frame = load_live_model_frame(conn, session_id=session_id)
    if live_frame.empty:
        return pd.DataFrame()
    return score_frame(live_frame)


def build_explanation(row):
    benchmarks = get_benchmark_stats()
    medians = benchmarks["medians"]
    stds = benchmarks["stds"]
    thresholds = benchmarks["thresholds"]

    top_drivers = []
    for feature, config in RISK_SIGNAL_CONFIG.items():
        value = float(row.get(feature, 0) or 0)
        benchmark = float(config.get("benchmark", thresholds.get(config.get("benchmark_key", ""), medians.get(feature, 0))))
        scale = float(stds.get(feature, 1) or 1)
        importance = feature_importance_map.get(feature, 0.01)

        if config["direction"] == "high":
            magnitude = max(0.0, value - benchmark) / max(scale, 1e-6)
        else:
            magnitude = max(0.0, benchmark - value) / max(scale, 1e-6)

        if magnitude <= 0:
            continue

        top_drivers.append(
            {
                "feature": feature,
                "label": config["label"],
                "value": round(value, 4),
                "benchmark": round(benchmark, 4),
                "impact": round(float(magnitude * importance), 4),
                "why": config["why"],
                "recommended_action": config["action"],
            }
        )

    top_drivers = sorted(top_drivers, key=lambda item: item["impact"], reverse=True)[:5]

    positive_signals = []
    for feature, label in [("purchase_count", "Purchase completed"), ("revenue", "Revenue captured"), ("error_rate", "Low error load")]:
        value = float(row.get(feature, 0) or 0)
        benchmark = float(medians.get(feature, 0))
        if feature in {"purchase_count", "revenue"} and value > benchmark:
            positive_signals.append({"label": label, "value": round(value, 4)})
        if feature == "error_rate" and value <= benchmark:
            positive_signals.append({"label": label, "value": round(value, 4)})

    driver_labels = ", ".join(driver["label"].lower() for driver in top_drivers[:3]) or "mixed signals"
    level = row.get("friction_level", "Medium")
    if level == "High":
        narrative = f"This session is trending high-friction, mainly because of {driver_labels}."
    elif level == "Low":
        narrative = f"This session is comparatively smooth, with only light pressure from {driver_labels}."
    else:
        narrative = f"This session is showing moderate friction, driven by {driver_labels}."

    recommendations = []
    for driver in top_drivers:
        action = driver["recommended_action"]
        if action not in recommendations:
            recommendations.append(action)

    if not recommendations:
        recommendations.append("Keep tracking this flow and compare the next few sessions for drift.")

    return {
        "narrative": narrative,
        "top_drivers": top_drivers,
        "positive_signals": positive_signals[:3],
        "recommendations": recommendations[:3],
    }


def session_prediction_payload(session_id):
    with sqlite3.connect(DB_PATH) as conn:
        candidate = load_live_model_frame(conn, session_id=session_id)
        source = "live"
        if candidate.empty:
            historical = load_historical_model_frame(conn)
            candidate = historical[historical["session_id"] == session_id] if not historical.empty else pd.DataFrame()
            source = "historical"

    if candidate.empty:
        return None

    scored = score_frame(candidate)
    if scored.empty:
        return None

    row = scored.iloc[0]
    explanation = build_explanation(row)
    return {
        "session_id": int(row["session_id"]),
        "source": source,
        "user_id": str(row.get("user_id", "")),
        "device_type": row.get("device_type", "unknown"),
        "browser": row.get("browser", "unknown"),
        "friction_level": row["friction_level"],
        "friction_score": round(float(row["friction_score"]), 4),
        "probabilities": {
            "Low": round(float(row.get("low_probability", 0)), 4),
            "Medium": round(float(row.get("medium_probability", 0)), 4),
            "High": round(float(row.get("high_probability", 0)), 4),
        },
        "metrics": {
            "total_clicks": int(row.get("total_clicks", 0) or 0),
            "dwell_time": int(row.get("dwell_time", 0) or 0),
            "page_switch_count": int(row.get("page_switch_count", 0) or 0),
            "purchase_count": int(row.get("purchase_count", 0) or 0),
            "total_errors": int(row.get("total_errors", 0) or 0),
            "revenue": round(float(row.get("revenue", 0) or 0), 2),
        },
        **explanation,
    }


@app.route("/api/friction/summary")
def friction_summary():
    scored = get_live_scored_frame()
    if scored.empty:
        return jsonify([])

    summary = (
        scored.groupby("friction_level", dropna=False)
        .agg(sessions=("session_id", "count"), avg_score=("friction_score", "mean"))
        .reset_index()
    )
    order = {"Low": 1, "Medium": 2, "High": 3}
    summary["sort_order"] = summary["friction_level"].map(order).fillna(99)
    summary = summary.sort_values("sort_order").drop(columns=["sort_order"])
    summary["avg_score"] = summary["avg_score"].round(4)
    return jsonify(summary.to_dict(orient="records"))


@app.route("/api/kpis")
def kpis():
    scored = get_live_scored_frame()
    if scored.empty:
        return jsonify(
            {
                "total_sessions": 0,
                "total_users": 0,
                "conversion_rate": 0,
                "avg_session_duration": 0,
                "error_rate": 0,
            }
        )

    total_sessions = int(len(scored))
    total_users = int(scored["user_id"].astype(str).nunique())
    conversion_rate = round(float((scored["purchase_count"] > 0).mean() * 100), 2) if total_sessions else 0
    avg_session_duration = round(float(scored["dwell_time"].mean()), 0) if total_sessions else 0
    total_events = float(scored["total_clicks"].sum())
    total_errors = float(scored["total_errors"].sum())
    error_rate = round((total_errors * 100.0 / total_events), 2) if total_events else 0
    return jsonify(
        {
            "total_sessions": total_sessions,
            "total_users": total_users,
            "conversion_rate": conversion_rate,
            "avg_session_duration": avg_session_duration,
            "error_rate": error_rate,
        }
    )


@app.route("/api/trend")
def trend():
    days = request.args.get("days", 14, type=int)
    scored = get_live_scored_frame()
    if scored.empty:
        return jsonify([])

    frame = scored.copy()
    frame["day"] = pd.to_datetime(frame["timestamp"], errors="coerce").dt.strftime("%Y-%m-%d")
    cutoff = (pd.Timestamp.now() - pd.Timedelta(days=days)).strftime("%Y-%m-%d")
    frame = frame[frame["day"] >= cutoff]
    if frame.empty:
        return jsonify([])

    trend_df = (
        frame.groupby(["day", "friction_level"], dropna=False)
        .size()
        .reset_index(name="sessions")
        .sort_values("day")
    )
    return jsonify(trend_df.to_dict(orient="records"))


@app.route("/api/funnel")
def funnel():
    scored = get_live_scored_frame()
    row = {
        "total_sessions": int(len(scored)),
        "browsing_sessions": int((scored["total_clicks"] >= 1).sum()) if not scored.empty else 0,
        "engaged_sessions": int((scored["page_switch_count"] >= 2).sum()) if not scored.empty else 0,
        "purchase_sessions": int((scored["purchase_count"] > 0).sum()) if not scored.empty else 0,
    }
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
    scored = get_live_scored_frame()
    if scored.empty:
        return jsonify([])

    frame = scored.copy()
    if friction != "all":
        frame = frame[frame["friction_level"] == friction]
    if device != "all":
        frame = frame[frame["device_type"].astype(str).str.lower() == device.lower()]

    frame = frame.sort_values(["timestamp"], ascending=[False]).head(limit)
    response = frame[["session_id", "user_id", "device_type", "browser", "timestamp", "dwell_time", "friction_level", "friction_score", "total_clicks", "revenue"]].copy()
    response = response.rename(columns={"dwell_time": "session_duration", "total_clicks": "total_events"})
    response["session_id"] = response["session_id"].astype(int)
    response["friction_score"] = response["friction_score"].round(4)
    response["revenue"] = response["revenue"].round(2)
    return jsonify(response.to_dict(orient="records"))


@app.route("/api/devices")
def devices():
    scored = get_live_scored_frame()
    if scored.empty:
        return jsonify([])

    device_df = (
        scored.assign(device_type=scored["device_type"].fillna("unknown").replace("", "unknown"))
        .groupby(["device_type", "friction_level"], dropna=False)
        .size()
        .reset_index(name="sessions")
        .sort_values("device_type")
    )
    return jsonify(device_df.to_dict(orient="records"))


@app.route("/api/predict/live", methods=["POST"])
def predict_live():
    data = request.get_json() or {}
    session_id = data.get("session_id")
    if session_id is None:
        return jsonify({"error": "session_id is required"}), 400

    payload = session_prediction_payload(int(session_id))
    if payload is None:
        return jsonify({"error": f"Session {session_id} not found"}), 404
    return jsonify(payload)


@app.route("/api/errors")
def errors():
    df = query_or_empty(
        """
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
        """,
        columns=["friction_level", "error_rate", "total_errors", "total_events"],
    )
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/live/overview")
def live_overview():
    minutes = request.args.get("minutes", 15, type=int)
    summary = query_or_empty(
        """
        SELECT
            COUNT(DISTINCT session_id) AS active_sessions,
            COUNT(*) AS total_events,
            SUM(COALESCE(error_flag, 0)) AS total_errors,
            COUNT(DISTINCT CASE WHEN LOWER(COALESCE(event_type, '')) = 'purchase' THEN session_id END) AS purchase_sessions
        FROM live_event_stream
        WHERE event_time >= DATETIME('now', ?)
        """,
        [f"-{minutes} minutes"],
        ["active_sessions", "total_events", "total_errors", "purchase_sessions"],
    )
    row = summary.to_dict(orient="records")[0] if not summary.empty else {
        "active_sessions": 0,
        "total_events": 0,
        "total_errors": 0,
        "purchase_sessions": 0,
    }

    with sqlite3.connect(DB_PATH) as conn:
        live_frame = load_live_model_frame(conn)
    scored = score_frame(live_frame)
    high_risk = int((scored["friction_level"] == "High").sum()) if not scored.empty else 0
    medium_risk = int((scored["friction_level"] == "Medium").sum()) if not scored.empty else 0

    return jsonify(
        {
            "active_sessions": int(row["active_sessions"] or 0),
            "events_last_window": int(row["total_events"] or 0),
            "errors_last_window": int(row["total_errors"] or 0),
            "purchase_sessions": int(row["purchase_sessions"] or 0),
            "high_risk_live_sessions": high_risk,
            "medium_risk_live_sessions": medium_risk,
        }
    )


@app.route("/api/live/timeseries")
def live_timeseries():
    minutes = request.args.get("minutes", 30, type=int)
    df = query_or_empty(
        """
        SELECT
            strftime('%Y-%m-%d %H:%M', event_time) AS bucket,
            COUNT(*) AS total_events,
            SUM(COALESCE(error_flag, 0)) AS total_errors
        FROM live_event_stream
        WHERE event_time >= DATETIME('now', ?)
        GROUP BY strftime('%Y-%m-%d %H:%M', event_time)
        ORDER BY bucket
        """,
        [f"-{minutes} minutes"],
        ["bucket", "total_events", "total_errors"],
    )
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/live/feed")
def live_feed():
    limit = request.args.get("limit", 20, type=int)
    df = query_or_empty(
        """
        SELECT
            event_id,
            session_id,
            COALESCE(user_id, CAST(session_id AS TEXT)) AS user_id,
            COALESCE(page_name, 'unknown') AS page_name,
            COALESCE(device_type, 'unknown') AS device_type,
            COALESCE(browser, 'unknown') AS browser,
            COALESCE(event_type, 'unknown') AS event_type,
            COALESCE(error_flag, 0) AS error_flag,
            COALESCE(amount, 0) AS amount,
            event_time
        FROM live_event_stream
        ORDER BY event_time DESC, event_id DESC
        LIMIT ?
        """,
        [limit],
        ["event_id", "session_id", "user_id", "page_name", "device_type", "browser", "event_type", "error_flag", "amount", "event_time"],
    )
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/live/sessions")
def live_sessions():
    limit = request.args.get("limit", 10, type=int)
    with sqlite3.connect(DB_PATH) as conn:
        live_frame = load_live_model_frame(conn)
    scored = score_frame(live_frame)
    if scored.empty:
        return jsonify([])

    response = (
        scored.sort_values(["timestamp"], ascending=[False])
        .head(limit)[["session_id", "user_id", "device_type", "browser", "friction_level", "friction_score", "total_clicks", "total_errors", "revenue"]]
        .copy()
    )
    response["session_id"] = response["session_id"].astype(int)
    response["friction_score"] = response["friction_score"].round(4)
    return jsonify(response.to_dict(orient="records"))


@app.route("/api/explain/<int:session_id>")
def explain_session(session_id):
    payload = session_prediction_payload(session_id)
    if payload is None:
        return jsonify({"error": f"Session {session_id} not found"}), 404
    return jsonify(payload)


@app.route("/api/track", methods=["POST"])
def track_event():
    data = request.get_json() or {}
    session_id = int(data.get("session_id") or int(datetime.now(timezone.utc).timestamp() * 1000))
    user_id = str(data.get("user_id") or session_id)
    event_type = str(data.get("event_type") or "page_view")
    page_name = str(data.get("page_name") or "/")
    device_type = str(data.get("device_type") or "web")
    browser = str(data.get("browser") or "unknown")
    error_flag = int(bool(data.get("error_flag", 0)))
    amount = float(data.get("amount") or 0)
    event_time = str(data.get("event_time") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    metadata = data.get("metadata") or {}

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO live_event_stream (
                session_id, user_id, event_type, page_name, event_time,
                device_type, browser, error_flag, amount, metadata
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                user_id,
                event_type,
                page_name,
                event_time,
                device_type,
                browser,
                error_flag,
                amount,
                json.dumps(metadata),
            ),
        )
        conn.commit()
        event_id = cursor.lastrowid

    global benchmark_cache
    benchmark_cache = None

    prediction = session_prediction_payload(session_id)
    return jsonify(
        {
            "ok": True,
            "event_id": int(event_id),
            "session_id": session_id,
            "prediction": prediction,
        }
    )


@app.route("/")
def dashboard():
    return render_template("dashboard.html")

# NOTE:
# Runtime scoring here is model-first. There are no hard click/error thresholds in this version.
# So a session can still be labeled "Low" even with many clicks unless other friction signals
# (errors/retries/backtracking/abandonment patterns) raise the model probability.
# For local run: default port is 5000.

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5050")),
        debug=False,
        use_reloader=False,
    )
