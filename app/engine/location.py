import re

# Major Indian tech cities — extend as needed
KNOWN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh",
    "Indore", "Bhopal", "Kochi", "Coimbatore", "Nagpur", "Surat",
    "Gurgaon", "Gurugram", "Noida", "Guwahati", "Bhubaneswar",
    "Thiruvananthapuram", "Visakhapatnam", "Mangalore", "Mysore",
    "New Delhi", "Navi Mumbai", "Thane",
]

# Signals for event type detection
ONLINE_SIGNALS = [
    "online", "virtual", "remote", "from anywhere", "work from home",
    "online mode", "virtual event", "virtual hackathon",
]

OFFLINE_SIGNALS = [
    "in-person", "in person", "on-site", "onsite", "on campus",
    "at the venue", "physical", "offline",
]

HYBRID_SIGNALS = [
    "hybrid", "both online and offline", "online & offline",
    "online and offline", "virtual & in-person",
]


def extract_location(text: str) -> str:
    """
    Extract the most likely city name from event text.
    Returns the first matched city or 'Unknown'.
    """
    for city in KNOWN_CITIES:
        # Case-insensitive whole-word match to avoid false positives
        pattern = r'\b' + re.escape(city) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return city
    return "Unknown"


def detect_event_type(text: str) -> str:
    """
    Determine if event is Online, Offline, or Hybrid.
    Checks hybrid first (since hybrid text often contains both signals).
    """
    text_lower = text.lower()

    # Hybrid check first — it often contains both online & offline keywords
    if any(sig in text_lower for sig in HYBRID_SIGNALS):
        return "Hybrid"

    has_offline = any(sig in text_lower for sig in OFFLINE_SIGNALS)
    has_online = any(sig in text_lower for sig in ONLINE_SIGNALS)

    if has_offline and has_online:
        return "Hybrid"
    if has_offline:
        return "Offline"
    if has_online:
        return "Online"

    return "Unknown"
