import sqlite3
from collections import Counter

import joblib
import numpy as np

from db_config import DB_PATH
from yoochoose_pipeline import FEATURES, build_feature_frame, load_yoochoose_sessions


artifact = joblib.load("friction_model.pkl")
model = artifact["model"]
le = artifact["encoder"]
print("Model loaded successfully.")
print(f"Features: {FEATURES}")

print(f"\nLoading Yoochoose sessions from: {DB_PATH}")
with sqlite3.connect(DB_PATH) as conn:
    raw_df = load_yoochoose_sessions(conn)

print(f"Loaded {len(raw_df):,} sessions")
df = build_feature_frame(raw_df, artifact=artifact)

print("\nRunning predictions...")
X = df[FEATURES]
probas = model.predict_proba(X)
pred_enc = np.argmax(probas, axis=1)
friction_level = le.inverse_transform(pred_enc)
friction_score = (1 - probas.max(axis=1)).round(4)

rows = [
    (
        int(session_id),
        level,
        float(score),
        round(float(low_prob), 4),
        round(float(medium_prob), 4),
        round(float(high_prob), 4),
    )
    for session_id, level, score, low_prob, medium_prob, high_prob in zip(
        df["session_id"],
        friction_level,
        friction_score,
        probas[:, list(le.classes_).index("Low")],
        probas[:, list(le.classes_).index("Medium")],
        probas[:, list(le.classes_).index("High")],
    )
]

with sqlite3.connect(DB_PATH) as conn:
    cursor = conn.cursor()
    cursor.execute("""
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
    cursor.execute("DELETE FROM session_model_predictions")
    cursor.executemany("""
        INSERT INTO session_model_predictions (
            session_id, friction_level, friction_score,
            low_probability, medium_probability, high_probability
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()

dist = Counter(friction_level)
total = len(rows)

print(f"\n{'=' * 40}")
print(f"Predictions complete - {total:,} sessions")
print(f"{'=' * 40}")
for level in ["Low", "Medium", "High"]:
    count = dist[level]
    pct = count / total * 100 if total else 0
    bar = "#" * int(pct / 2)
    print(f"  {level:<8} {count:>5,}  ({pct:5.1f}%)  {bar}")
print(f"{'=' * 40}")

print("\nVerify with:")
print("SELECT friction_level, COUNT(*), ROUND(AVG(friction_score), 3)")
print("FROM session_model_predictions GROUP BY friction_level;")
