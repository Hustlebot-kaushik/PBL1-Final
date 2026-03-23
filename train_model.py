import sqlite3

import joblib
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

from db_config import DB_PATH
from yoochoose_pipeline import FEATURES, build_feature_frame, derive_training_labels, load_yoochoose_sessions


print(f"Loading Yoochoose sessions from: {DB_PATH}")
with sqlite3.connect(DB_PATH) as conn:
    df = load_yoochoose_sessions(conn)

print(f"Loaded {len(df):,} sessions")
df = build_feature_frame(df)
df["friction_level"], thresholds = derive_training_labels(df)

print("\nTraining thresholds:")
for key, value in thresholds.items():
    print(f"  {key:<12} {value:.4f}")

print("\nLabel distribution:")
print(df["friction_level"].value_counts(normalize=True).mul(100).round(1).astype(str) + " %")
print(df["friction_level"].value_counts())

X = df[FEATURES]
le = LabelEncoder()
y = le.fit_transform(df["friction_level"])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

print("\nTraining model...")
model = GradientBoostingClassifier(
    n_estimators=250,
    max_depth=3,
    learning_rate=0.05,
    subsample=0.9,
    random_state=42,
)
model.fit(X_train, y_train)

cv = cross_val_score(model, X, y, cv=StratifiedKFold(5), scoring="f1_macro")
print(f"\nCV F1-macro: {cv.mean():.3f} +/- {cv.std():.3f}")
print("\nClassification Report:")
print(classification_report(y_test, model.predict(X_test), target_names=le.classes_, zero_division=0))

print("\nTop 10 most important features:")
importances = sorted(zip(FEATURES, model.feature_importances_), key=lambda item: item[1], reverse=True)[:10]
for feature, importance in importances:
    bar = "#" * int(importance * 100)
    print(f"  {feature:<22} {importance:.4f}  {bar}")

artifact = {
    "model": model,
    "features": FEATURES,
    "encoder": le,
    "thresholds": thresholds,
    "device_categories": sorted(df["device_type"].fillna("unknown").astype(str).str.lower().unique().tolist()),
    "browser_categories": sorted(df["browser"].fillna("unknown").astype(str).str.lower().unique().tolist()),
    "usertype_categories": sorted(df["user_type"].fillna("guest").astype(str).str.lower().unique().tolist()),
}
joblib.dump(artifact, "friction_model.pkl")
print("\nSaved friction_model.pkl")
print("Now run: python predict_sessions.py")
