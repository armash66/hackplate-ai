import os
import requests

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def send_telegram_alert(title: str, url: str, keywords: list[str],
                        score: int, location: str, event_type: str) -> bool:
    """
    Send a Telegram message when a food event is detected.
    Returns True on success, False on failure or if not configured.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("  [telegram] Not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env")
        return False

    message = (
        f"*Food Detected -- HackPlate Alert*\n\n"
        f"*Title:* {title}\n"
        f"*Score:* {score}\n"
        f"*Location:* {location}\n"
        f"*Type:* {event_type}\n"
        f"*Keywords:* {', '.join(keywords)}\n"
        f"*URL:* {url}"
    )

    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False,
    }

    try:
        resp = requests.post(api_url, json=payload, timeout=10)
        if resp.status_code == 200:
            print(f"  [telegram] Alert sent for: {title}")
            return True
        else:
            print(f"  [telegram] Error {resp.status_code}: {resp.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"  [telegram] Request failed: {e}")
        return False