import sqlite3
import hashlib
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "hackplate.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database and create tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            url_hash    TEXT UNIQUE NOT NULL,
            title       TEXT NOT NULL,
            url         TEXT NOT NULL,
            keywords    TEXT NOT NULL,
            food_score  INTEGER NOT NULL DEFAULT 0,
            scraped_at  TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def url_hash(url: str) -> str:
    """Generate a SHA256 hash of a URL for deduplication."""
    return hashlib.sha256(url.encode()).hexdigest()


def is_duplicate(url: str) -> bool:
    """Check if an event URL has already been stored."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM events WHERE url_hash = ?", (url_hash(url),))
    result = cursor.fetchone()
    conn.close()
    return result is not None


def save_event(title: str, url: str, keywords: list[str], food_score: int):
    """
    Save a food-detected event to the database.
    Skips if the URL already exists (deduplication).
    Returns True if saved, False if duplicate.
    """
    if is_duplicate(url):
        return False

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO events (url_hash, title, url, keywords, food_score, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            url_hash(url),
            title,
            url,
            json.dumps(keywords),
            food_score,
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return True


def get_all_events():
    """Retrieve all stored events, newest first."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY scraped_at DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def print_stored_events():
    """Pretty-print all events stored in the database."""
    events = get_all_events()
    if not events:
        print("📭 No events stored yet.")
        return

    print(f"\n📦 Stored Events ({len(events)} total):")
    print("=" * 40)
    for ev in events:
        keywords = json.loads(ev["keywords"])
        print(f"🍕 {ev['title']}")
        print(f"   URL      : {ev['url']}")
        print(f"   Keywords : {', '.join(keywords)}")
        print(f"   Score    : {ev['food_score']}")
        print(f"   Saved At : {ev['scraped_at']}")
        print("-" * 40)
