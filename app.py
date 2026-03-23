from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text
import pandas as pd
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# ── Database + model ──────────────────────────────────────────────────────────
engine = create_engine(
    "mysql+mysqlconnector://root:Kaushik%400512@localhost/behavioral_analytics"
)

artifact = joblib.load("friction_model.pkl")
model    = artifact["model"]
FEATURES = artifact["features"]
le       = artifact["encoder"]

# ── Helper ────────────────────────────────────────────────────────────────────
def query(sql, params=None):
    with engine.connect() as conn:
        return pd.read_sql(text(sql), conn, params=params)

# ─────────────────────────────────────────────────────────────────────────────
# 1. FRICTION SUMMARY
# GET /api/friction/summary
# Returns count + avg_score per friction level
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/friction/summary")
def friction_summary():
    df = query("""
        SELECT
            friction_level,
            COUNT(*)                    AS sessions,
            ROUND(AVG(friction_score), 4) AS avg_score
        FROM session_friction
        GROUP BY friction_level
        ORDER BY FIELD(friction_level, 'Low', 'Medium', 'High')
    """)
    return jsonify(df.to_dict(orient="records"))


# ─────────────────────────────────────────────────────────────────────────────
# 2. KPI CARDS
# GET /api/kpis
# Returns top-level numbers for the dashboard cards
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/kpis")
def kpis():
    df = query("""
        SELECT
            COUNT(DISTINCT s.session_id)                              AS total_sessions,
            COUNT(DISTINCT s.user_id)                                 AS total_users,
            ROUND(
                COUNT(DISTINCT CASE WHEN e.event_type = 'purchase'
                THEN s.session_id END) /
                COUNT(DISTINCT s.session_id) * 100, 2)                AS conversion_rate,
            ROUND(AVG(
                TIMESTAMPDIFF(SECOND, s.start_time, s.end_time)
            ), 0)                                                      AS avg_session_duration,
            ROUND(SUM(e.error_flag) /
                  COUNT(e.event_id) * 100, 2)                         AS error_rate
        FROM sessions s
        LEFT JOIN events e ON s.session_id = e.session_id
    """)
    return jsonify(df.to_dict(orient="records")[0])


# ─────────────────────────────────────────────────────────────────────────────
# 3. DAILY TREND
# GET /api/trend?days=14
# Returns daily session counts by friction level
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/trend")
def trend():
    days = request.args.get("days", 14, type=int)
    df = query(f"""
        SELECT
            DATE(s.start_time)    AS day,
            sf.friction_level,
            COUNT(*)              AS sessions
        FROM sessions s
        JOIN session_friction sf ON s.session_id = sf.session_id
        WHERE s.start_time >= DATE_SUB(
            (SELECT MAX(start_time) FROM sessions), INTERVAL {days} DAY
        )
        GROUP BY DATE(s.start_time), sf.friction_level
        ORDER BY day
    """)
    return jsonify(df.to_dict(orient="records"))


# ─────────────────────────────────────────────────────────────────────────────
# 4. CONVERSION FUNNEL
# GET /api/funnel
# Returns event counts for funnel stages
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/funnel")
def funnel():
    df = query("""
        SELECT
            COUNT(DISTINCT session_id)                                    AS total_sessions,
            COUNT(DISTINCT CASE WHEN event_type='page_view'
                  THEN session_id END)                                    AS page_view_sessions,
            COUNT(DISTINCT CASE WHEN event_type='product_view'
                  THEN session_id END)                                    AS product_view_sessions,
            COUNT(DISTINCT CASE WHEN event_type='add_to_cart'
                  THEN session_id END)                                    AS cart_sessions,
            COUNT(DISTINCT CASE WHEN event_type='purchase'
                  THEN session_id END)                                    AS purchase_sessions
        FROM events
    """)
    row = df.to_dict(orient="records")[0]
    total = int(row["total_sessions"])
    result = [
        {"stage": "Page view",    "count": int(row["page_view_sessions"]),    "pct": round(int(row["page_view_sessions"])   /total*100,1)},
        {"stage": "Product view", "count": int(row["product_view_sessions"]), "pct": round(int(row["product_view_sessions"])/total*100,1)},
        {"stage": "Add to cart",  "count": int(row["cart_sessions"]),         "pct": round(int(row["cart_sessions"])        /total*100,1)},
        {"stage": "Purchase",     "count": int(row["purchase_sessions"]),     "pct": round(int(row["purchase_sessions"])    /total*100,1)},
    ]
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# 5. SESSION TABLE
# GET /api/sessions?limit=50&friction=High&device=mobile
# Returns paginated session list with filters
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/sessions")
def sessions():
    limit   = request.args.get("limit",   50,   type=int)
    friction= request.args.get("friction","all")
    device  = request.args.get("device",  "all")

    where = ["1=1"]
    if friction != "all":
        where.append(f"sf.friction_level = '{friction}'")
    if device != "all":
        where.append(f"s.device_type = '{device}'")

    df = query(f"""
        SELECT
            s.session_id,
            s.user_id,
            s.device_type,
            s.browser,
            s.session_duration,
            sf.friction_level,
            ROUND(sf.friction_score, 4)  AS friction_score,
            COUNT(e.event_id)            AS total_events,
            SUM(e.event_type='purchase') AS purchased,
            COALESCE(SUM(e.amount), 0)   AS revenue
        FROM sessions s
        JOIN session_friction sf ON s.session_id = sf.session_id
        LEFT JOIN events e       ON s.session_id = e.session_id
        WHERE {' AND '.join(where)}
        GROUP BY s.session_id, s.user_id, s.device_type, s.browser,
                 s.session_duration, sf.friction_level, sf.friction_score
        ORDER BY sf.friction_score DESC
        LIMIT {limit}
    """)
    return jsonify(df.to_dict(orient="records"))


# ─────────────────────────────────────────────────────────────────────────────
# 6. DEVICE BREAKDOWN
# GET /api/devices
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/devices")
def devices():
    df = query("""
        SELECT
            s.device_type,
            sf.friction_level,
            COUNT(*) AS sessions
        FROM sessions s
        JOIN session_friction sf ON s.session_id = sf.session_id
        GROUP BY s.device_type, sf.friction_level
        ORDER BY s.device_type
    """)
    return jsonify(df.to_dict(orient="records"))


# ─────────────────────────────────────────────────────────────────────────────
# 7. LIVE PREDICTION
# POST /api/predict/live
# Body: { "session_id": 123 } — scores a single session in real time
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/predict/live", methods=["POST"])
def predict_live():
    data       = request.get_json()
    session_id = data.get("session_id")

    df = query(f"""
        SELECT
            s.session_id,
            s.session_duration,
            s.device_type,
            u.user_type,
            COUNT(e.event_id)                        AS total_events,
            SUM(e.event_type = 'page_view')          AS page_views,
            SUM(e.event_type = 'product_view')       AS product_views,
            SUM(e.event_type = 'add_to_cart')        AS add_to_cart,
            SUM(e.event_type = 'purchase')           AS purchases,
            SUM(e.event_type = 'click')              AS clicks,
            SUM(e.event_type = 'login')              AS logins,
            SUM(e.event_type = 'logout')             AS logouts,
            COALESCE(SUM(e.action_duration), 0)      AS total_dwell,
            COALESCE(SUM(e.error_flag), 0)           AS total_errors,
            COUNT(DISTINCT e.screen_id)              AS unique_screens,
            COALESCE(SUM(e.amount), 0)               AS total_amount
        FROM sessions s
        INNER JOIN events e ON s.session_id = e.session_id
        INNER JOIN users  u ON s.user_id    = u.user_id
        WHERE s.session_id = {session_id}
        GROUP BY s.session_id, s.session_duration, s.device_type, u.user_type
    """)

    if df.empty:
        return jsonify({"error": f"Session {session_id} not found"}), 404

    df["error_rate"]         = df["total_errors"]   / (df["total_events"] + 1)
    df["click_ratio"]        = df["clicks"]         / (df["total_events"] + 1)
    df["browse_depth"]       = df["product_views"]  / (df["page_views"]   + 1)
    df["avg_time_per_event"] = df["total_dwell"]    / (df["total_events"] + 1)
    df["screen_variety"]     = df["unique_screens"] / (df["total_events"] + 1)
    df["cart_ratio"]         = df["add_to_cart"]    / (df["product_views"] + 1e-6)
    df["login_ratio"]        = df["logins"]         / (df["total_events"] + 1)
    df["logout_ratio"]       = df["logouts"]        / (df["total_events"] + 1)
    df["converted"]          = (df["purchases"] > 0).astype(int)
    df["has_amount"]         = (df["total_amount"]  > 0).astype(int)
    df["device_enc"]         = df["device_type"].map({"mobile": 0, "desktop": 1, "tablet": 2}).fillna(0)
    df["usertype_enc"]       = df["user_type"].map({"guest": 0, "registered": 1, "premium": 2}).fillna(0)
    df = df.fillna(0)

    X              = df[FEATURES]
    probas         = model.predict_proba(X)
    pred_enc       = np.argmax(probas, axis=1)
    friction_level = le.inverse_transform(pred_enc)[0]
    friction_score = float((1 - probas.max(axis=1))[0])

    return jsonify({
        "session_id":    session_id,
        "friction_level": friction_level,
        "friction_score": round(friction_score, 4),
        "probabilities": {
            cls: round(float(prob), 4)
            for cls, prob in zip(le.classes_, probas[0])
        }
    })


# ─────────────────────────────────────────────────────────────────────────────
# 8. ERROR RATE BY FRICTION
# GET /api/errors
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/api/errors")
def errors():
    df = query("""
        SELECT
            sf.friction_level,
            ROUND(SUM(e.error_flag) / COUNT(e.event_id) * 100, 2) AS error_rate,
            SUM(e.error_flag)   AS total_errors,
            COUNT(e.event_id)   AS total_events
        FROM session_friction sf
        JOIN events e ON sf.session_id = e.session_id
        GROUP BY sf.friction_level
        ORDER BY FIELD(sf.friction_level, 'Low', 'Medium', 'High')
    """)
    return jsonify(df.to_dict(orient="records"))
from flask import render_template

@app.route("/")
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)