import mysql.connector
import pandas as pd
import random
from datetime import datetime, date
import os

conn = mysql.connector.connect(
    host=os.environ.get("DB_HOST", "localhost"),
    user=os.environ.get("DB_USER", "root"),
    password=os.environ.get("DB_PASSWORD", "Kaushik@0512"),
    database=os.environ.get("DB_NAME", "behavioral_analytics"),
)
cursor = conn.cursor()

df = pd.read_csv(r"C:\Users\Lenovo\Downloads\friction detection system\friction detection system\backend\dataset\ecommerce_clickstream_10k.csv")
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
print(f"Loaded {len(df):,} rows from CSV")

# ── 1. USERS ──────────────────────────────────────────────────────────────────
user_types   = ["guest", "registered", "premium"]
countries    = ["IN", "US", "GB", "DE", "BR", "AU", "SG", "AE"]
device_prefs = ["mobile", "desktop", "tablet"]

unique_users = df["UserID"].unique()
user_rows = []
for uid in unique_users:
    signup = date(2023, 1, 1).toordinal() + random.randint(0, 700)
    user_rows.append((
        int(uid),
        date.fromordinal(signup),
        random.choice(user_types),
        random.choice(countries),
        random.choice(device_prefs),
    ))

cursor.executemany("""
    INSERT IGNORE INTO users
        (user_id, signup_date, user_type, country, device_preference)
    VALUES (%s, %s, %s, %s, %s)
""", user_rows)
print(f"Inserted {len(user_rows):,} users")

# ── 2. SCREENS ────────────────────────────────────────────────────────────────
cursor.execute("SELECT COUNT(*) FROM screens")
if cursor.fetchone()[0] == 0:
    screen_data = [
        ("Home",            "landing"),
        ("Search",          "browse"),
        ("Category",        "browse"),
        ("Product Detail",  "product"),
        ("Product Images",  "product"),
        ("Reviews",         "product"),
        ("Cart",            "checkout"),
        ("Mini Cart",       "checkout"),
        ("Checkout Step 1", "checkout"),
        ("Checkout Step 2", "checkout"),
        ("Checkout Step 3", "checkout"),
        ("Payment",         "checkout"),
        ("Order Confirm",   "checkout"),
        ("Account",         "account"),
        ("Order History",   "account"),
        ("Wishlist",        "account"),
        ("Settings",        "account"),
        ("Login",           "auth"),
        ("Register",        "auth"),
        ("Forgot Password", "auth"),
        ("Flash Sale",      "promo"),
        ("Bundle Deal",     "promo"),
        ("Trending",        "browse"),
        ("Recently Viewed", "browse"),
        ("404 Error",       "error"),
    ]
    cursor.executemany(
        "INSERT IGNORE INTO screens (screen_id, screen_name, screen_type) VALUES (%s, %s, %s)",
        [(i+1, name, stype) for i, (name, stype) in enumerate(screen_data)]
    )
    print("Inserted 25 screens")

# ── 3. SESSIONS ───────────────────────────────────────────────────────────────
browsers   = ["Chrome", "Edge", "Firefox", "Safari"]
devices    = ["mobile", "desktop", "tablet"]
session_df = df.groupby("SessionID").agg(
    user_id    = ("UserID",    "first"),
    start_time = ("Timestamp", "min"),
    end_time   = ("Timestamp", "max"),
).reset_index()

session_rows = []
for _, row in session_df.iterrows():
    duration = int((row["end_time"] - row["start_time"]).total_seconds())
    session_rows.append((
        int(row["SessionID"]),
        int(row["user_id"]),
        row["start_time"].to_pydatetime(),
        row["end_time"].to_pydatetime(),
        duration,
        random.randint(1, 25),   # entry_screen_id
        random.randint(1, 25),   # exit_screen_id
        random.choice(devices),
        random.choice(browsers),
    ))

cursor.executemany("""
    INSERT IGNORE INTO sessions
        (session_id, user_id, start_time, end_time, session_duration,
         entry_screen_id, exit_screen_id, device_type, browser)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
""", session_rows)
print(f"Inserted {len(session_rows):,} sessions")

# ── 4. EVENTS ─────────────────────────────────────────────────────────────────
event_rows = []
for _, row in df.iterrows():
    screen_id  = random.randint(1, 25)
    prev_screen= random.randint(1, 25)
    error_flag = 1 if random.random() < 0.05 else 0
    duration   = random.randint(1, 8) if row["EventType"] == "click" else random.randint(4, 40)
    product_id = row["ProductID"] if pd.notna(row["ProductID"]) else None
    amount     = float(row["Amount"]) if pd.notna(row["Amount"]) else None

    event_rows.append((
        int(row["SessionID"]),
        int(row["UserID"]),
        screen_id,
        prev_screen,
        row["EventType"],
        row["Timestamp"].to_pydatetime(),
        duration,
        error_flag,
        product_id,
        amount,
    ))

# Insert in batches of 5000 to avoid memory issues
batch_size = 5000
for i in range(0, len(event_rows), batch_size):
    cursor.executemany("""
        INSERT INTO events
            (session_id, user_id, screen_id, previous_screen_id,
             event_type, event_time, action_duration, error_flag,
             product_id, amount)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, event_rows[i:i+batch_size])
    print(f"  Events inserted: {min(i+batch_size, len(event_rows)):,} / {len(event_rows):,}")

print(f"Inserted {len(event_rows):,} events total")

# ── 5. SESSION_FRICTION (rule-based labels from real data) ────────────────────
session_stats = df.groupby("SessionID").agg(
    total_events  = ("EventType", "count"),
    purchases     = ("EventType", lambda x: (x == "purchase").sum()),
    add_to_cart   = ("EventType", lambda x: (x == "add_to_cart").sum()),
    product_views = ("EventType", lambda x: (x == "product_view").sum()),
    clicks        = ("EventType", lambda x: (x == "click").sum()),
).reset_index()

session_stats["converted"]   = session_stats["purchases"] > 0
session_stats["click_ratio"] = session_stats["clicks"] / (session_stats["total_events"] + 1)
session_stats["cart_ratio"]  = session_stats["add_to_cart"] / (session_stats["product_views"] + 1e-6)

def label(row):
    if row["converted"]:
        return "Low",  round(random.uniform(0.05, 0.25), 4)
    if row["click_ratio"] > 0.45 and row["cart_ratio"] < 0.05:
        return "High", round(random.uniform(0.65, 0.95), 4)
    if row["add_to_cart"] >= 1 or row["product_views"] >= 3:
        return "Medium", round(random.uniform(0.30, 0.60), 4)
    return "Low", round(random.uniform(0.05, 0.30), 4)

friction_rows = []
for _, row in session_stats.iterrows():
    lvl, score = label(row)
    friction_rows.append((int(row["SessionID"]), score, lvl))

cursor.executemany("""
    INSERT INTO session_friction (session_id, friction_score, friction_level)
    VALUES (%s, %s, %s)
    ON DUPLICATE KEY UPDATE
        friction_score = VALUES(friction_score),
        friction_level = VALUES(friction_level)
""", friction_rows)
print(f"Inserted {len(friction_rows):,} friction labels")

conn.commit()
cursor.close()
conn.close()
print("\nAll done! Database fully loaded from CSV.")