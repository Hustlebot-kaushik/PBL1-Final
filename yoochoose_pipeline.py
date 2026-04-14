import sqlite3  # Used to connect to SQLite database
import pandas as pd  # Used for data manipulation and analysis


# List of all features used for ML model input
# Includes raw features + engineered features + encoded categorical features
FEATURES = [
    "total_clicks",
    "back_clicks",
    "retry_count",
    "dwell_time",
    "page_switch_count",
    "purchase_count",
    "revenue",
    "total_errors",
    "unique_screens",
    "distinct_event_types",
    "checkout_events",
    "search_events",
    # Derived behavioral metrics
    "backtrack_ratio",
    "retry_ratio",
    "dwell_per_click",
    "switch_ratio",
    "error_rate",
    "screen_variety",
    "event_variety",
    "checkout_ratio",
    "search_ratio",
    # Encoded categorical variables
    "device_enc",
    "browser_enc",
    "usertype_enc",
]


# SQL query to extract session-level data
# Combines multiple tables: session_analytics, events, purchases, users
# Uses LEFT JOIN to avoid losing sessions with missing data
BASE_QUERY = """
    SELECT
        sa.id AS session_id,
        sa.user_id,
        sa.device_type,
        sa.browser,
        sa.timestamp,
        sa.total_clicks,
        sa.back_clicks,
        sa.retry_count,
        sa.dwell_time,
        sa.page_switch_count,
        sa.purchase_count,

        -- Aggregated event data
        COALESCE(ev.total_errors, 0) AS total_errors,
        COALESCE(ev.unique_screens, 0) AS unique_screens,
        COALESCE(ev.distinct_event_types, 0) AS distinct_event_types,
        COALESCE(ev.checkout_events, 0) AS checkout_events,
        COALESCE(ev.search_events, 0) AS search_events,

        -- Revenue data from purchases
        COALESCE(pr.revenue, 0) AS revenue,

        -- User type (guest if missing)
        COALESCE(u.user_type, 'guest') AS user_type

    FROM session_analytics sa

    -- Subquery to aggregate event-level data
    LEFT JOIN (
        SELECT
            session_id,
            SUM(COALESCE(error_flag, 0)) AS total_errors,
            COUNT(DISTINCT screen_id) AS unique_screens,
            COUNT(DISTINCT COALESCE(LOWER(event_type), 'unknown')) AS distinct_event_types,

            -- Count checkout-related events
            SUM(CASE 
                WHEN LOWER(COALESCE(event_type, '')) IN ('checkout', 'payment', 'purchase') 
                THEN 1 ELSE 0 END) AS checkout_events,

            -- Count search events
            SUM(CASE 
                WHEN LOWER(COALESCE(event_type, '')) = 'search' 
                THEN 1 ELSE 0 END) AS search_events

        FROM events
        GROUP BY session_id
    ) ev ON sa.id = ev.session_id

    -- Subquery to calculate revenue per session
    LEFT JOIN (
        SELECT
            session_id,
            SUM(price * quantity) AS revenue
        FROM purchases
        GROUP BY session_id
    ) pr ON sa.id = pr.session_id

    -- Join user information
    LEFT JOIN users u ON CAST(sa.user_id AS INTEGER) = u.user_id
"""


# Function to load data from database into pandas DataFrame
def load_yoochoose_sessions(conn: sqlite3.Connection) -> pd.DataFrame:
    return pd.read_sql_query(BASE_QUERY, conn)


# Helper function to convert categorical values into numeric encoding
# Uses mapping dictionary; unknown values mapped to default
def _encode_with_map(series: pd.Series, mapping: dict[str, int]) -> pd.Series:
    normalized = series.fillna("unknown").astype(str).str.lower()
    return normalized.map(mapping).fillna(mapping.get("unknown", 0)).astype(int)


# Main feature engineering function
# Creates derived behavioral metrics and encodes categorical data
def build_feature_frame(df: pd.DataFrame, artifact: dict | None = None) -> pd.DataFrame:
    frame = df.copy()

    # Avoid division by zero by adding 1
    clicks_denom = frame["total_clicks"] + 1

    # Behavioral ratios (important for ML model)
    frame["backtrack_ratio"] = frame["back_clicks"] / clicks_denom
    frame["retry_ratio"] = frame["retry_count"] / clicks_denom
    frame["dwell_per_click"] = frame["dwell_time"] / clicks_denom
    frame["switch_ratio"] = frame["page_switch_count"] / clicks_denom
    frame["error_rate"] = frame["total_errors"] / clicks_denom
    frame["screen_variety"] = frame["unique_screens"] / clicks_denom
    frame["event_variety"] = frame["distinct_event_types"] / clicks_denom
    frame["checkout_ratio"] = frame["checkout_events"] / clicks_denom
    frame["search_ratio"] = frame["search_events"] / clicks_denom

    # If no pre-trained mapping exists, create new encoding maps
    if artifact is None:
        device_categories = sorted(frame["device_type"].fillna("unknown").astype(str).str.lower().unique().tolist())
        browser_categories = sorted(frame["browser"].fillna("unknown").astype(str).str.lower().unique().tolist())
        usertype_categories = sorted(frame["user_type"].fillna("guest").astype(str).str.lower().unique().tolist())
    else:
        # Use saved mappings for consistency during inference
        device_categories = artifact["device_categories"]
        browser_categories = artifact["browser_categories"]
        usertype_categories = artifact["usertype_categories"]

    # Create mapping dictionaries
    device_map = {name: index for index, name in enumerate(device_categories)}
    browser_map = {name: index for index, name in enumerate(browser_categories)}
    usertype_map = {name: index for index, name in enumerate(usertype_categories)}

    # Apply encoding
    frame["device_enc"] = _encode_with_map(frame["device_type"], device_map)
    frame["browser_enc"] = _encode_with_map(frame["browser"], browser_map)
    frame["usertype_enc"] = _encode_with_map(frame["user_type"], usertype_map)

    # Replace any remaining NaN values with 0
    frame = frame.fillna(0)

    return frame


# Function to generate training labels (Low, Medium, High difficulty sessions)
def derive_training_labels(frame: pd.DataFrame) -> tuple[pd.Series, dict[str, float]]:

    # Calculate thresholds using 75th percentile (adaptive thresholds)
    thresholds = {
        "retry_75": float(frame["retry_ratio"].quantile(0.75)),
        "back_75": float(frame["backtrack_ratio"].quantile(0.75)),
        "dwell_75": float(frame["dwell_per_click"].quantile(0.75)),
        "switch_75": float(frame["switch_ratio"].quantile(0.75)),
        "error_75": float(frame["error_rate"].quantile(0.75)),
        "search_75": float(frame["search_ratio"].quantile(0.75)),
        "screen_75": float(frame["screen_variety"].quantile(0.75)),
    }

    # Label logic based on user struggle behavior
    def label_row(row: pd.Series) -> str:

        # Easy sessions (successful + low struggle)
        if (
            row["purchase_count"] > 0
            and row["retry_ratio"] <= thresholds["retry_75"]
            and row["error_rate"] <= thresholds["error_75"]
        ):
            return "Low"

        points = 0  # Score representing difficulty level

        # Add points for problematic behavior
        if row["retry_ratio"] > thresholds["retry_75"]:
            points += 2
        if row["backtrack_ratio"] > thresholds["back_75"]:
            points += 2
        if row["dwell_per_click"] > thresholds["dwell_75"]:
            points += 1
        if row["switch_ratio"] > thresholds["switch_75"]:
            points += 1
        if row["error_rate"] > thresholds["error_75"]:
            points += 2
        if row["search_ratio"] > thresholds["search_75"] and row["purchase_count"] == 0:
            points += 1
        if row["checkout_events"] > 0 and row["purchase_count"] == 0:
            points += 1
        if row["screen_variety"] > thresholds["screen_75"] and row["purchase_count"] == 0:
            points += 1

        # Reduce points if purchase is successful
        if row["purchase_count"] > 0 or row["revenue"] > 0:
            points -= 2

        # Final classification
        if points >= 5:
            return "High"
        if points >= 2:
            return "Medium"
        return "Low"

    return frame.apply(label_row, axis=1), thresholds