import sqlite3

import pandas as pd


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
    "backtrack_ratio",
    "retry_ratio",
    "dwell_per_click",
    "switch_ratio",
    "error_rate",
    "screen_variety",
    "event_variety",
    "checkout_ratio",
    "search_ratio",
    "device_enc",
    "browser_enc",
    "usertype_enc",
]


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
        COALESCE(ev.total_errors, 0) AS total_errors,
        COALESCE(ev.unique_screens, 0) AS unique_screens,
        COALESCE(ev.distinct_event_types, 0) AS distinct_event_types,
        COALESCE(ev.checkout_events, 0) AS checkout_events,
        COALESCE(ev.search_events, 0) AS search_events,
        COALESCE(pr.revenue, 0) AS revenue,
        COALESCE(u.user_type, 'guest') AS user_type
    FROM session_analytics sa
    LEFT JOIN (
        SELECT
            session_id,
            SUM(COALESCE(error_flag, 0)) AS total_errors,
            COUNT(DISTINCT screen_id) AS unique_screens,
            COUNT(DISTINCT COALESCE(LOWER(event_type), 'unknown')) AS distinct_event_types,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) IN ('checkout', 'payment', 'purchase') THEN 1 ELSE 0 END) AS checkout_events,
            SUM(CASE WHEN LOWER(COALESCE(event_type, '')) = 'search' THEN 1 ELSE 0 END) AS search_events
        FROM events
        GROUP BY session_id
    ) ev ON sa.id = ev.session_id
    LEFT JOIN (
        SELECT
            session_id,
            SUM(price * quantity) AS revenue
        FROM purchases
        GROUP BY session_id
    ) pr ON sa.id = pr.session_id
    LEFT JOIN users u ON CAST(sa.user_id AS INTEGER) = u.user_id
"""


def load_yoochoose_sessions(conn: sqlite3.Connection) -> pd.DataFrame:
    return pd.read_sql_query(BASE_QUERY, conn)


def _encode_with_map(series: pd.Series, mapping: dict[str, int]) -> pd.Series:
    normalized = series.fillna("unknown").astype(str).str.lower()
    return normalized.map(mapping).fillna(mapping.get("unknown", 0)).astype(int)


def build_feature_frame(df: pd.DataFrame, artifact: dict | None = None) -> pd.DataFrame:
    frame = df.copy()
    clicks_denom = frame["total_clicks"] + 1

    frame["backtrack_ratio"] = frame["back_clicks"] / clicks_denom
    frame["retry_ratio"] = frame["retry_count"] / clicks_denom
    frame["dwell_per_click"] = frame["dwell_time"] / clicks_denom
    frame["switch_ratio"] = frame["page_switch_count"] / clicks_denom
    frame["error_rate"] = frame["total_errors"] / clicks_denom
    frame["screen_variety"] = frame["unique_screens"] / clicks_denom
    frame["event_variety"] = frame["distinct_event_types"] / clicks_denom
    frame["checkout_ratio"] = frame["checkout_events"] / clicks_denom
    frame["search_ratio"] = frame["search_events"] / clicks_denom

    if artifact is None:
        device_categories = sorted(frame["device_type"].fillna("unknown").astype(str).str.lower().unique().tolist())
        browser_categories = sorted(frame["browser"].fillna("unknown").astype(str).str.lower().unique().tolist())
        usertype_categories = sorted(frame["user_type"].fillna("guest").astype(str).str.lower().unique().tolist())
    else:
        device_categories = artifact["device_categories"]
        browser_categories = artifact["browser_categories"]
        usertype_categories = artifact["usertype_categories"]

    device_map = {name: index for index, name in enumerate(device_categories)}
    browser_map = {name: index for index, name in enumerate(browser_categories)}
    usertype_map = {name: index for index, name in enumerate(usertype_categories)}

    frame["device_enc"] = _encode_with_map(frame["device_type"], device_map)
    frame["browser_enc"] = _encode_with_map(frame["browser"], browser_map)
    frame["usertype_enc"] = _encode_with_map(frame["user_type"], usertype_map)
    frame = frame.fillna(0)
    return frame


def derive_training_labels(frame: pd.DataFrame) -> tuple[pd.Series, dict[str, float]]:
    thresholds = {
        "retry_75": float(frame["retry_ratio"].quantile(0.75)),
        "back_75": float(frame["backtrack_ratio"].quantile(0.75)),
        "dwell_75": float(frame["dwell_per_click"].quantile(0.75)),
        "switch_75": float(frame["switch_ratio"].quantile(0.75)),
        "error_75": float(frame["error_rate"].quantile(0.75)),
        "search_75": float(frame["search_ratio"].quantile(0.75)),
        "screen_75": float(frame["screen_variety"].quantile(0.75)),
    }

    def label_row(row: pd.Series) -> str:
        if (
            row["purchase_count"] > 0
            and row["retry_ratio"] <= thresholds["retry_75"]
            and row["error_rate"] <= thresholds["error_75"]
        ):
            return "Low"

        points = 0
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
        if row["purchase_count"] > 0 or row["revenue"] > 0:
            points -= 2

        if points >= 5:
            return "High"
        if points >= 2:
            return "Medium"
        return "Low"

    return frame.apply(label_row, axis=1), thresholds
