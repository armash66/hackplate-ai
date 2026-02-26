import sys
import argparse
from pathlib import Path

# Ensure app/ is on Python path for package imports
APP_DIR = Path(__file__).parent
sys.path.insert(0, str(APP_DIR))

# Load .env from project root
try:
    from dotenv import load_dotenv
    load_dotenv(APP_DIR.parent / ".env")
except ImportError:
    pass

from scraper import scrape_devfolio
from engine.detector import detect_food
from engine.location import extract_location, detect_event_type
from storage.db import init_db, is_duplicate, save_event, get_events, get_event_count
from notifier.telegram import send_telegram_alert


def parse_args():
    parser = argparse.ArgumentParser(description="HackPlate v2 -- Student Event Intelligence")
    parser.add_argument("--location", type=str, default=None,
                        help="Filter events by city name (e.g. Mumbai, Delhi, Bangalore)")
    parser.add_argument("--limit", type=int, default=5,
                        help="Number of hackathons to scrape (default: 5)")
    parser.add_argument("--show-db", action="store_true",
                        help="Show all stored events and exit")
    return parser.parse_args()


def print_dashboard(location_filter, total_scanned, food_events, new_saved):
    print()
    print("=" * 50)
    print("  HackPlate v2 -- Scan Summary")
    print("=" * 50)
    if location_filter:
        print(f"  Location Filter : {location_filter}")
    print(f"  Events Scanned  : {total_scanned}")
    print(f"  Food Detected   : {food_events}")
    print(f"  New Saved to DB : {new_saved}")
    print(f"  Total in DB     : {get_event_count()}")
    print("=" * 50)


def print_event(idx, title, url, location, event_type, keywords, score):
    print()
    print(f"  {idx}. {title}")
    print(f"     Score    : {score}")
    print(f"     Type     : {event_type}")
    print(f"     City     : {location}")
    print(f"     Keywords : {', '.join(keywords)}")
    print(f"     URL      : {url}")


def show_stored_events(location_filter):
    events = get_events(location_filter)
    if not events:
        label = f" in {location_filter}" if location_filter else ""
        print(f"\n  No stored events{label}.")
        return

    print()
    print("=" * 50)
    print(f"  Stored Events ({len(events)} total)")
    print("=" * 50)
    import json
    for i, ev in enumerate(events, 1):
        kw = json.loads(ev["keywords"]) if isinstance(ev["keywords"], str) else ev["keywords"]
        print_event(i, ev["title"], ev["url"], ev["location"],
                    ev["event_type"], kw, ev["food_score"])
    print()


def main():
    args = parse_args()

    # Initialize DB
    init_db()

    # --show-db mode: just display and exit
    if args.show_db:
        show_stored_events(args.location)
        return

    print()
    print("=" * 50)
    print("  HackPlate v2 -- Student Radar Engine")
    print("=" * 50)

    # 1. Scrape
    hackathons = scrape_devfolio(limit=args.limit)

    total_scanned = len(hackathons)
    food_count = 0
    new_saved = 0
    results = []

    for event in hackathons:
        title = event["title"]
        url = event["url"]
        content = event["content"]

        # 2. Detect food
        food_detected, keywords, score = detect_food(content)
        if not food_detected:
            print(f"  [skip] {title} -- no food detected")
            continue

        # 3. Extract location + type
        location = extract_location(content)
        event_type = detect_event_type(content)

        # 4. Apply location filter if provided
        if args.location:
            if location.lower() != args.location.lower():
                print(f"  [skip] {title} -- location: {location} (filtered out)")
                continue

        food_count += 1
        results.append({
            "title": title, "url": url, "location": location,
            "event_type": event_type, "keywords": keywords, "score": score,
        })

        # 5. Dedup + save
        if is_duplicate(url):
            print(f"  [dup]  {title} -- already in database")
        else:
            save_event(title, url, location, event_type, keywords, score)
            new_saved += 1
            print(f"  [new]  {title} -- saved (score: {score})")

            # 6. Notify
            send_telegram_alert(title, url, keywords, score, location, event_type)

    # 7. Print results
    if results:
        print()
        print("-" * 50)
        print("  Food Events Found:")
        print("-" * 50)
        for i, r in enumerate(results, 1):
            print_event(i, r["title"], r["url"], r["location"],
                        r["event_type"], r["keywords"], r["score"])

    # 8. Dashboard
    print_dashboard(args.location, total_scanned, food_count, new_saved)


if __name__ == "__main__":
    main()
