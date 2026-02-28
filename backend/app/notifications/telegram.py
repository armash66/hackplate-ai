import requests
from ..config import get_settings

settings = get_settings()


def send_telegram(title: str, url: str, city: str,
                  event_type: str, score: int, keywords: list[str]) -> bool:
    """Send a Telegram alert for a detected event."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        print("  [telegram] Not configured -- skipping")
        return False

    # Use HTML parse mode to avoid Markdown escaping issues
    kw_text = ", ".join(keywords[:5]) if keywords else "—"
    food_icon = "🍕 " if any(k in ["food", "meals", "lunch", "dinner", "snacks"] for k in keywords) else ""

    message = (
        f"<b>HackPlate Alert</b>\n\n"
        f"<b>{_escape_html(title)}</b>\n"
        f"Score: {score} | City: {_escape_html(city)} | Type: {_escape_html(event_type)}\n"
        f"{food_icon}Keywords: {_escape_html(kw_text)}\n\n"
        f'<a href="{url}">View Event →</a>'
    )

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML",
                "disable_web_page_preview": False,
            },
            timeout=10,
        )
        if resp.status_code == 200:
            print(f"  [telegram] Alert sent: {title}")
            return True
        print(f"  [telegram] Error {resp.status_code}: {resp.text[:200]}")
        return False
    except Exception as e:
        print(f"  [telegram] Failed: {e}")
        return False


def _escape_html(text: str) -> str:
    """Escape HTML special characters for Telegram."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
