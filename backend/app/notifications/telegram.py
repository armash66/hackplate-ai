import requests
from ..config import get_settings

settings = get_settings()


def send_telegram(title: str, url: str, city: str,
                  event_type: str, score: int, keywords: list[str]) -> bool:
    """Send a Telegram alert for a detected food event."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        print("  [telegram] Not configured -- skipping")
        return False

    message = (
        f"*HackPlate Alert*\n\n"
        f"*{title}*\n"
        f"Score: {score} | City: {city} | Type: {event_type}\n"
        f"Keywords: {', '.join(keywords)}\n"
        f"[View Event]({url})"
    )

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": message,
                  "parse_mode": "Markdown", "disable_web_page_preview": False},
            timeout=10,
        )
        if resp.status_code == 200:
            print(f"  [telegram] Alert sent: {title}")
            return True
        print(f"  [telegram] Error {resp.status_code}")
        return False
    except Exception as e:
        print(f"  [telegram] Failed: {e}")
        return False
