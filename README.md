# PBL1-Final

This project now uses a local SQLite database file instead of MySQL.

## Files
- `behavioral_analytics.db`: demo database file for the project
- `dataset/ecommerce_clickstream_10k.csv`: source clickstream dataset
- `friction_model.pkl`: trained friction model

## Setup
1. Run `python load_csv.py` to create `behavioral_analytics.db` from the CSV.
2. Run `python predict_sessions.py` to populate `session_friction` using the saved model.
3. Run `python app.py` to start the Flask dashboard.

No MySQL server is required.
