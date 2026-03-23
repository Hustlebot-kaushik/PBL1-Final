import pandas as pd
from sqlalchemy import create_engine
import mysql.connector
import joblib
import numpy as np
import os

# ── Load model ────────────────────────────────────────────────────────────────
artifact = joblib.load("friction_model.pkl")
model    = artifact["model"]
FEATURES = artifact["features"]
le       = artifact["encoder"]
print(f"Model loaded successfully.")
print(f"Features: {FEATURES}")

# ── SQLAlchemy for reading ────────────────────────────────────────────────────
engine = create_engine(
    "mysql+mysqlconnector://root:Kaushik%400512@localhost/behavioral_analytics"
)

print("\nLoading sessions from database...")

df = pd.read_sql("""
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
    GROUP BY s.session_id, s.session_duration, s.device_type, u.user_type
    HAVING COUNT(e.event_id) > 0
""", engine)

print(f"Loaded {len(df):,} sessions")

# ── Same feature engineering as train_model.py ────────────────────────────────
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

# ── Predict ───────────────────────────────────────────────────────────────────
print("\nRunning predictions...")
X              = df[FEATURES]
probas         = model.predict_proba(X)
pred_enc       = np.argmax(probas, axis=1)
friction_level = le.inverse_transform(pred_enc)

# 1 - confidence = friction score (higher = more uncertain = more friction)
friction_score = (1 - probas.max(axis=1)).round(4)

# ── Write to session_friction ─────────────────────────────────────────────────
print("Writing predictions to database...")

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Kaushik@0512",
    database="behavioral_analytics",
)
cursor = conn.cursor()

rows = [
    (int(sid), float(fs), fl)
    for sid, fs, fl in zip(df["session_id"], friction_score, friction_level)
]

cursor.executemany("""
    INSERT INTO session_friction
        (session_id, friction_score, friction_level)
    VALUES (%s, %s, %s)
    ON DUPLICATE KEY UPDATE
        friction_score = VALUES(friction_score),
        friction_level = VALUES(friction_level)
""", rows)

conn.commit()
cursor.close()
conn.close()

# ── Summary ───────────────────────────────────────────────────────────────────
from collections import Counter
dist = Counter(friction_level)
total = len(rows)

print(f"\n{'─'*40}")
print(f"Predictions complete — {total:,} sessions")
print(f"{'─'*40}")
for lvl in ["Low", "Medium", "High"]:
    count = dist[lvl]
    pct   = count / total * 100
    bar   = "█" * int(pct / 2)
    print(f"  {lvl:<8} {count:>5,}  ({pct:5.1f}%)  {bar}")
print(f"{'─'*40}")

print("\nVerify in Workbench:")
print("SELECT friction_level, COUNT(*), ROUND(AVG(friction_score),3)")
print("FROM session_friction GROUP BY friction_level;")