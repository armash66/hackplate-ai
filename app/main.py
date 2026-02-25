import sys
import os
from pathlib import Path

# Ensure app/ directory is on the path for sibling module imports
APP_DIR = Path(__file__).parent
sys.path.insert(0, str(APP_DIR))

# Load .env from project root (optional — graceful fallback)
try:
    from dotenv import load_dotenv
    load_dotenv(APP_DIR.parent / ".env")
except ImportError:
    pass

from scraper import scrape_devfolio
from detector import detect_food
from database import init_db, save_event, is_duplicate
from notifier import send_telegram_alert


def print_banner():
    print("=" * 40)
    print("  🚀 HackPlate v1.5 — Food Intelligence")
    print("=" * 40)


def print_food_found(title, url, keywords, score):
    print("\n" + "=" * 40)
    print("🍕 Food Detected!")
    print(f"   Title    : {title}")
    print(f"   URL      : {url}")
    print(f"   Keywords : {', '.join(keywords)}")
    print(f"   Score    : {score}")
    print("=" * 40)


def main():
    print_banner()

    # 1. Initialize the database
    init_db()

    # 2. Scrape Devfolio
    hackathons = scrape_devfolio(limit=5)
    print(f"\n✅ Scraped {len(hackathons)} hackathons.\n")

    found_any = False
    for event in hackathons:
        title = event["title"]
        url = event["url"]
        content = event["content"]

        # 3. Run food detection with scoring
        food_detected, keywords, score = detect_food(content)

        if not food_detected:
            print(f"⏭  Skipping: {title} (no food detected)")
            continue

        found_any = True
        print_food_found(title, url, keywords, score)

        # 4. Check for duplicate before storing/notifying
        if is_duplicate(url):
            print(f"   ℹ️  Already in database — skipping save & notify.")
            continue

        # 5. Save to SQLite
        save_event(title, url, keywords, score)
        print(f"   💾 Saved to database.")

        # 6. Send Telegram alert
        send_telegram_alert(title, url, keywords, score)

    if not found_any:
        print("\n😔 No food perks found in the latest hackathons.")

    print("\n✅ HackPlate v1.5 run complete.")


if __name__ == "__main__":
    main()
