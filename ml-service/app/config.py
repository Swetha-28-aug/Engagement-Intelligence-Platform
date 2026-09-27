import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hope_platform")
ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", "8000"))
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3000")

RISK_THRESHOLDS = {
    "low_max": 30,
    "medium_max": 60,
    "high_min": 61,
}

ALERT_COOLDOWN_DAYS = 7
CHRONIC_REALERT_DAYS = 14
ANOMALY_CONTAMINATION = 0.1
