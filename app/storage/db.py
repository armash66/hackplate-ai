import sqlite3
import hashlib
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "hackplate.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create events table if it doesn't exist."""
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            url_hash    TEXT UNIQUE NOT NULL,
            title       TEXT NOT NULL,
            url         TEXT NOT NULL,
            location    TEXT DEFAULT 'Unknown',
            event_type  TEXT DEFAULT 'Unknown',
            keywords    TEXT NOT NULL DEFAULT '[]',
            food_score  INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()


def is_duplicate(url: str) -> bool:
    """Check if URL already stored. Core deduplication."""
    conn = get_connection()
    row = conn.execute("SELECT 1 FROM events WHERE url_hash = ?", (url_hash(url),)).fetchone()
    conn.close()
    return row is not None


def save_event(title: str, url: str, location: str, event_type: str,
               keywords: list[str], food_score: int) -> bool:
    """
    Save event to DB. Returns True if saved, False if duplicate.
    """
    if is_duplicate(url):
        return False

    conn = get_connection()
    conn.execute(
        """INSERT INTO events (url_hash, title, url, location, event_type,
           keywords, food_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            url_hash(url),
            title,
            url,
            location,
            event_type,
            json.dumps(keywords),
            food_score,
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return True


def get_events(location_filter: str = None) -> list[dict]:
    """Retrieve events, optionally filtered by location (case-insensitive)."""
    conn = get_connection()
    if location_filter:
        rows = conn.execute(
            "SELECT * FROM events WHERE LOWER(location) = LOWER(?) ORDER BY food_score DESC",
            (location_filter,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM events ORDER BY food_score DESC"
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_event_count() -> int:
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
    conn.close()
    return count
