import sqlite3  # For database connection

import joblib  # Used to save trained model and artifacts
from sklearn.ensemble import GradientBoostingClassifier  # ML model
from sklearn.metrics import classification_report  # For evaluation
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split  # Splitting & validation
from sklearn.preprocessing import LabelEncoder  # Convert labels to numeric

# Import database path and pipeline functions
from db_config import DB_PATH
from yoochoose_pipeline import FEATURES, build_feature_frame, derive_training_labels, load_yoochoose_sessions


# Load dataset from database
print(f"Loading Yoochoose sessions from: {DB_PATH}")
with sqlite3.connect(DB_PATH) as conn:
    df = load_yoochoose_sessions(conn)

print(f"Loaded {len(df):,} sessions")


# Perform feature engineering (ratios, encoding, etc.)
df = build_feature_frame(df)

# Generate labels (Low / Medium / High friction)
df["friction_level"], thresholds = derive_training_labels(df)


# Display threshold values used for labeling
print("\nTraining thresholds:")
for key, value in thresholds.items():
    print(f"  {key:<12} {value:.4f}")


# Show label distribution (important to check class imbalance)
print("\nLabel distribution:")
print(df["friction_level"].value_counts(normalize=True).mul(100).round(1).astype(str) + " %")
print(df["friction_level"].value_counts())


# Prepare input features (X) and target labels (y)
X = df[FEATURES]

# Convert categorical labels (Low, Medium, High) → numeric values (0,1,2)
le = LabelEncoder()
y = le.fit_transform(df["friction_level"])


# Split data into training and testing sets (75% train, 25% test)
# stratify=y ensures class balance is maintained
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)


print("\nTraining model...")

# Initialize Gradient Boosting model (ensemble method)
model = GradientBoostingClassifier(
    n_estimators=250,      # Number of trees
    max_depth=3,           # Depth of each tree (controls complexity)
    learning_rate=0.05,    # Step size (lower = more stable learning)
    subsample=0.9,         # Use 90% data per tree (reduces overfitting)
    random_state=42,
)

# Train model on training data
model.fit(X_train, y_train)


# Perform cross-validation (5-fold) to evaluate model stability
cv = cross_val_score(model, X, y, cv=StratifiedKFold(5), scoring="f1_macro")
print(f"\nCV F1-macro: {cv.mean():.3f} +/- {cv.std():.3f}")


# Evaluate model on test set
print("\nClassification Report:")
print(classification_report(
    y_test,
    model.predict(X_test),
    target_names=le.classes_,
    zero_division=0
))


# Display most important features used by model
print("\nTop 10 most important features:")
importances = sorted(
    zip(FEATURES, model.feature_importances_),
    key=lambda item: item[1],
    reverse=True
)[:10]

# Print feature importance as text bar chart
for feature, importance in importances:
    bar = "#" * int(importance * 100)
    print(f"  {feature:<22} {importance:.4f}  {bar}")


# Save everything needed for prediction (model + preprocessing info)
artifact = {
    "model": model,
    "features": FEATURES,
    "encoder": le,
    "thresholds": thresholds,

    # Save category mappings to ensure consistency during prediction
    "device_categories": sorted(df["device_type"].fillna("unknown").astype(str).str.lower().unique().tolist()),
    "browser_categories": sorted(df["browser"].fillna("unknown").astype(str).str.lower().unique().tolist()),
    "usertype_categories": sorted(df["user_type"].fillna("guest").astype(str).str.lower().unique().tolist()),
}

# Save model to file
joblib.dump(artifact, "friction_model.pkl")

print("\nSaved friction_model.pkl")
print("Now run: python predict_sessions.py")