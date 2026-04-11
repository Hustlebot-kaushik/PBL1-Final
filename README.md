# PBL1-Final

This project now uses a local SQLite database file instead of MySQL and includes a live tracking layer for real-time event ingestion.

## Files
- `yoochoose.db`: SQLite database used by the Flask dashboard
- `dataset/ecommerce_clickstream_10k.csv`: source clickstream dataset
- `friction_model.pkl`: trained friction model
- `app.py`: dashboard server with historical analytics, live tracking APIs, and explainable AI endpoints

## Setup
1. Run `python load_csv.py` to create `yoochoose.db` from the CSV if you need to rebuild the database.
2. Run `python predict_sessions.py` to populate `session_model_predictions` using the saved model.
3. Run `python app.py` to start the Flask dashboard.

No MySQL server is required.

## New endpoints
- `POST /api/track`: ingest a live product event into `live_event_stream`
- `GET /api/live/overview`: summarize active live sessions and risky sessions
- `GET /api/live/feed`: list recent tracked events
- `GET /api/live/sessions`: rank current live sessions by friction risk
- `GET /api/explain/<session_id>`: return explainable AI output for a historical or live session
