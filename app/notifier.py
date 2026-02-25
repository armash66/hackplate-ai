import os
import requests

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def send_telegram_alert(title: str, url: str, keywords: list[str], score: int) -> bool:
    """
    Sends a Telegram message when a food event is detected.
    Reads token and chat_id from .env via environment variables.
    Returns True on success, False on failure or if not configured.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️  Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env")
        return False

    message = (
        f"🍕 *Food Detected — HackPlate Alert*\n\n"
        f"*Title:* {title}\n"
        f"*Score:* {score}/10\n"
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
        response = requests.post(api_url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"📨 Telegram alert sent for: {title}")
            return True
        else:
            print(f"❌ Telegram error {response.status_code}: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Telegram request failed: {e}")
        return False
