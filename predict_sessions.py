import sqlite3  # Database connection
from collections import Counter  # For counting prediction distribution

import joblib  # Load trained model
import numpy as np  # Numerical operations

# Import configs and feature pipeline
from db_config import DB_PATH
from yoochoose_pipeline import FEATURES, build_feature_frame, load_yoochoose_sessions


# Load saved model and preprocessing artifacts
artifact = joblib.load("friction_model.pkl")
model = artifact["model"]
le = artifact["encoder"]

print("Model loaded successfully.")
print(f"Features: {FEATURES}")


# Load raw session data from database
print(f"\nLoading Yoochoose sessions from: {DB_PATH}")
with sqlite3.connect(DB_PATH) as conn:
    raw_df = load_yoochoose_sessions(conn)

print(f"Loaded {len(raw_df):,} sessions")


# Apply same feature engineering as training
# (IMPORTANT: ensures consistency using saved artifact mappings)
df = build_feature_frame(raw_df, artifact=artifact)


print("\nRunning predictions...")

# Extract features
X = df[FEATURES]

# Get probability predictions for each class
probas = model.predict_proba(X)

# Get predicted class index (highest probability)
pred_enc = np.argmax(probas, axis=1)

# Convert numeric labels back to original labels (Low, Medium, High)
friction_level = le.inverse_transform(pred_enc)

# Friction score = uncertainty (lower confidence → higher friction)
friction_score = (1 - probas.max(axis=1)).round(4)


# Prepare rows for database insertion
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

        # Extract probabilities for each class
        probas[:, list(le.classes_).index("Low")],
        probas[:, list(le.classes_).index("Medium")],
        probas[:, list(le.classes_).index("High")],
    )
]


# Save predictions into database
with sqlite3.connect(DB_PATH) as conn:
    cursor = conn.cursor()

    # Create table if not exists
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

    # Clear old predictions
    cursor.execute("DELETE FROM session_model_predictions")

    # Insert new predictions
    cursor.executemany("""
        INSERT INTO session_model_predictions (
            session_id, friction_level, friction_score,
            low_probability, medium_probability, high_probability
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()


# Analyze prediction distribution
dist = Counter(friction_level)
total = len(rows)

print(f"\n{'=' * 40}")
print(f"Predictions complete - {total:,} sessions")
print(f"{'=' * 40}")

# Display distribution of predicted classes
for level in ["Low", "Medium", "High"]:
    count = dist[level]
    pct = count / total * 100 if total else 0
    bar = "#" * int(pct / 2)
    print(f"  {level:<8} {count:>5,}  ({pct:5.1f}%)  {bar}")

print(f"{'=' * 40}")


# SQL query for verification
print("\nVerify with:")
print("SELECT friction_level, COUNT(*), ROUND(AVG(friction_score), 3)")
print("FROM session_model_predictions GROUP BY friction_level;")