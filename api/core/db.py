import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """
    Get a PostgreSQL connection. Returns None gracefully if DATABASE_URL is not set or DB is unreachable,
    allowing the app to fall back to snapshots without crashing.
    """
    if not DATABASE_URL:
        return None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, connect_timeout=4)
        return conn
    except Exception as e:
        print(f"Warning: Database connection failed ({e}). Using local fallback snapshots.")
        return None

