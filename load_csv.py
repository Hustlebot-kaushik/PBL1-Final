import random
import sqlite3
from datetime import date

import pandas as pd

from db_config import CSV_PATH, DB_PATH

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON")

cursor.executescript("""
DROP TABLE IF EXISTS session_friction;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS screens;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    signup_date TEXT NOT NULL,
    user_type TEXT NOT NULL,
    country TEXT NOT NULL,
    device_preference TEXT NOT NULL
);

CREATE TABLE screens (
    screen_id INTEGER PRIMARY KEY,
    screen_name TEXT NOT NULL,
    screen_type TEXT NOT NULL
);

CREATE TABLE sessions (
    session_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    session_duration INTEGER NOT NULL,
    entry_screen_id INTEGER,
    exit_screen_id INTEGER,
    device_type TEXT NOT NULL,
    browser TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (entry_screen_id) REFERENCES screens(screen_id),
    FOREIGN KEY (exit_screen_id) REFERENCES screens(screen_id)
);

CREATE TABLE events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    screen_id INTEGER,
    previous_screen_id INTEGER,
    event_type TEXT NOT NULL,
    event_time TEXT NOT NULL,
    action_duration INTEGER,
    error_flag INTEGER NOT NULL DEFAULT 0,
    product_id TEXT,
    amount REAL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (screen_id) REFERENCES screens(screen_id),
    FOREIGN KEY (previous_screen_id) REFERENCES screens(screen_id)
);

CREATE TABLE session_friction (
    session_id INTEGER PRIMARY KEY,
    friction_score REAL NOT NULL,
    friction_level TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_session_friction_level ON session_friction(friction_level);
""")


df = pd.read_csv(CSV_PATH)
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
print(f"Loaded {len(df):,} rows from CSV")

user_types = ["guest", "registered", "premium"]
countries = ["IN", "US", "GB", "DE", "BR", "AU", "SG", "AE"]
device_prefs = ["mobile", "desktop", "tablet"]

unique_users = df["UserID"].unique()
user_rows = []
for uid in unique_users:
    signup = date(2023, 1, 1).toordinal() + random.randint(0, 700)
    user_rows.append((
        int(uid),
        date.fromordinal(signup).isoformat(),
        random.choice(user_types),
        random.choice(countries),
        random.choice(device_prefs),
    ))

cursor.executemany(
    "INSERT INTO users (user_id, signup_date, user_type, country, device_preference) VALUES (?, ?, ?, ?, ?)",
    user_rows,
)
print(f"Inserted {len(user_rows):,} users")

screen_data = [
    ("Home", "landing"),
    ("Search", "browse"),
    ("Category", "browse"),
    ("Product Detail", "product"),
    ("Product Images", "product"),
    ("Reviews", "product"),
    ("Cart", "checkout"),
    ("Mini Cart", "checkout"),
    ("Checkout Step 1", "checkout"),
    ("Checkout Step 2", "checkout"),
    ("Checkout Step 3", "checkout"),
    ("Payment", "checkout"),
    ("Order Confirm", "checkout"),
    ("Account", "account"),
    ("Order History", "account"),
    ("Wishlist", "account"),
    ("Settings", "account"),
    ("Login", "auth"),
    ("Register", "auth"),
    ("Forgot Password", "auth"),
    ("Flash Sale", "promo"),
    ("Bundle Deal", "promo"),
    ("Trending", "browse"),
    ("Recently Viewed", "browse"),
    ("404 Error", "error"),
]
cursor.executemany(
    "INSERT INTO screens (screen_id, screen_name, screen_type) VALUES (?, ?, ?)",
    [(i + 1, name, stype) for i, (name, stype) in enumerate(screen_data)],
)
print("Inserted 25 screens")

browsers = ["Chrome", "Edge", "Firefox", "Safari"]
devices = ["mobile", "desktop", "tablet"]
session_df = df.groupby("SessionID").agg(
    user_id=("UserID", "first"),
    start_time=("Timestamp", "min"),
    end_time=("Timestamp", "max"),
).reset_index()

session_rows = []
for _, row in session_df.iterrows():
    duration = int((row["end_time"] - row["start_time"]).total_seconds())
    session_rows.append((
        int(row["SessionID"]),
        int(row["user_id"]),
        row["start_time"].to_pydatetime().isoformat(sep=" "),
        row["end_time"].to_pydatetime().isoformat(sep=" "),
        duration,
        random.randint(1, 25),
        random.randint(1, 25),
        random.choice(devices),
        random.choice(browsers),
    ))

cursor.executemany("""
    INSERT INTO sessions (
        session_id, user_id, start_time, end_time, session_duration,
        entry_screen_id, exit_screen_id, device_type, browser
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", session_rows)
print(f"Inserted {len(session_rows):,} sessions")

event_rows = []
for _, row in df.iterrows():
    screen_id = random.randint(1, 25)
    prev_screen = random.randint(1, 25)
    error_flag = 1 if random.random() < 0.05 else 0
    duration = random.randint(1, 8) if row["EventType"] == "click" else random.randint(4, 40)
    product_id = str(row["ProductID"]) if pd.notna(row["ProductID"]) else None
    amount = float(row["Amount"]) if pd.notna(row["Amount"]) else None

    event_rows.append((
        int(row["SessionID"]),
        int(row["UserID"]),
        screen_id,
        prev_screen,
        row["EventType"],
        row["Timestamp"].to_pydatetime().isoformat(sep=" "),
        duration,
        error_flag,
        product_id,
        amount,
    ))

batch_size = 5000
for i in range(0, len(event_rows), batch_size):
    cursor.executemany("""
        INSERT INTO events (
            session_id, user_id, screen_id, previous_screen_id,
            event_type, event_time, action_duration, error_flag,
            product_id, amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, event_rows[i:i + batch_size])
    print(f"  Events inserted: {min(i + batch_size, len(event_rows)):,} / {len(event_rows):,}")

print(f"Inserted {len(event_rows):,} events total")

session_stats = df.groupby("SessionID").agg(
    total_events=("EventType", "count"),
    purchases=("EventType", lambda x: (x == "purchase").sum()),
    add_to_cart=("EventType", lambda x: (x == "add_to_cart").sum()),
    product_views=("EventType", lambda x: (x == "product_view").sum()),
    clicks=("EventType", lambda x: (x == "click").sum()),
).reset_index()

session_stats["converted"] = session_stats["purchases"] > 0
session_stats["click_ratio"] = session_stats["clicks"] / (session_stats["total_events"] + 1)
session_stats["cart_ratio"] = session_stats["add_to_cart"] / (session_stats["product_views"] + 1e-6)


def label(row):
    if row["converted"]:
        return "Low", round(random.uniform(0.05, 0.25), 4)
    if row["click_ratio"] > 0.45 and row["cart_ratio"] < 0.05:
        return "High", round(random.uniform(0.65, 0.95), 4)
    if row["add_to_cart"] >= 1 or row["product_views"] >= 3:
        return "Medium", round(random.uniform(0.30, 0.60), 4)
    return "Low", round(random.uniform(0.05, 0.30), 4)


friction_rows = []
for _, row in session_stats.iterrows():
    level, score = label(row)
    friction_rows.append((int(row["SessionID"]), score, level))

cursor.executemany("""
    INSERT INTO session_friction (session_id, friction_score, friction_level)
    VALUES (?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
        friction_score = excluded.friction_score,
        friction_level = excluded.friction_level
""", friction_rows)
print(f"Inserted {len(friction_rows):,} friction labels")

conn.commit()
cursor.close()
conn.close()
print(f"\nAll done! SQLite database created at: {DB_PATH}")
