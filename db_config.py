from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "yoochoose.db"
CSV_PATH = BASE_DIR / "dataset" / "ecommerce_clickstream_10k.csv"
