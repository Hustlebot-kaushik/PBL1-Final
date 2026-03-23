import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import joblib

# ── Database connection ───────────────────────────────────────────────────────
engine = create_engine(
    "mysql+mysqlconnector://root:Kaushik%400512@localhost/behavioral_analytics"
)

print("Loading data from database...")

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
""", engine)

print(f"Loaded {len(df):,} sessions")

# ── Feature engineering ───────────────────────────────────────────────────────
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

# ── Percentile-based thresholds from real data ────────────────────────────────
click_75  = df["click_ratio"].quantile(0.75)
dwell_25  = df["avg_time_per_event"].quantile(0.25)
events_75 = df["total_events"].quantile(0.75)
browse_75 = df["browse_depth"].quantile(0.75)

print(f"\nThresholds — click_75: {click_75:.3f} | dwell_25: {dwell_25:.3f} | events_75: {events_75:.0f} | browse_75: {browse_75:.3f}")

# ── Labels ────────────────────────────────────────────────────────────────────
def label(row):
    if row["converted"] == 1:
        return "Low"

    friction_score = 0

    if row["click_ratio"] > click_75:
        friction_score += 2
    if row["avg_time_per_event"] < dwell_25:
        friction_score += 2
    if row["total_events"] > events_75 and row["converted"] == 0:
        friction_score += 2
    if row["browse_depth"] > browse_75 and row["cart_ratio"] < 0.05:
        friction_score += 1
    if row["add_to_cart"] >= 1 and row["converted"] == 0:
        friction_score += 1
    if row["logins"] >= 1 and row["converted"] == 0:
        friction_score += 1

    if friction_score >= 4:
        return "High"
    elif friction_score >= 1:
        return "Medium"
    return "Low"

df["friction_level"] = df.apply(label, axis=1)

print("\nLabel distribution:")
print(df["friction_level"].value_counts(normalize=True).mul(100).round(1).astype(str) + " %")
print(df["friction_level"].value_counts())

# ── Train ─────────────────────────────────────────────────────────────────────
FEATURES = [
    "total_events", "page_views", "product_views", "clicks",
    "logins", "logouts", "total_dwell", "session_duration",
    "unique_screens", "total_amount",
    "error_rate", "click_ratio", "browse_depth",
    "avg_time_per_event", "screen_variety", "cart_ratio",
    "login_ratio", "logout_ratio", "device_enc", "usertype_enc",
]

X  = df[FEATURES]
le = LabelEncoder()
y  = le.fit_transform(df["friction_level"])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

print("\nTraining model...")
model = GradientBoostingClassifier(
    n_estimators=200, max_depth=4,
    learning_rate=0.08, subsample=0.85,
    random_state=42
)
model.fit(X_train, y_train)

cv = cross_val_score(model, X, y,
                     cv=StratifiedKFold(5), scoring="f1_macro")
print(f"\nCV F1-macro: {cv.mean():.3f} ± {cv.std():.3f}")
print("\nClassification Report:")
print(classification_report(y_test, model.predict(X_test),
                             target_names=le.classes_, zero_division=0))

# ── Feature importance ────────────────────────────────────────────────────────
print("\nTop 10 most important features:")
importances = sorted(zip(FEATURES, model.feature_importances_),
                     key=lambda x: x[1], reverse=True)[:10]
for feat, imp in importances:
    bar = "█" * int(imp * 100)
    print(f"  {feat:<22} {imp:.4f}  {bar}")

# ── Save ──────────────────────────────────────────────────────────────────────
joblib.dump({"model": model, "features": FEATURES, "encoder": le},
            "friction_model.pkl")
print("\nSaved friction_model.pkl")
print("Now run: python predict_sessions.py")