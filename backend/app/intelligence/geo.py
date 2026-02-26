import re
import math
from functools import lru_cache

# --- City extraction ---
KNOWN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh",
    "Indore", "Bhopal", "Kochi", "Coimbatore", "Nagpur", "Surat",
    "Gurgaon", "Gurugram", "Noida", "Guwahati", "Bhubaneswar",
    "Thiruvananthapuram", "Visakhapatnam", "Mangalore", "Mysore",
    "New Delhi", "Navi Mumbai", "Thane",
]

ONLINE_SIGNALS = ["online", "virtual", "remote", "from anywhere", "virtual hackathon"]
OFFLINE_SIGNALS = ["in-person", "in person", "on-site", "onsite", "on campus", "offline"]
HYBRID_SIGNALS = ["hybrid", "both online and offline", "online & offline", "online and offline"]


def extract_location(text: str) -> str:
    """Extract first matched city from text. Returns 'Unknown' if none found."""
    for city in KNOWN_CITIES:
        if re.search(r'\b' + re.escape(city) + r'\b', text, re.IGNORECASE):
            return city
    return "Unknown"


def detect_event_type(text: str) -> str:
    """Detect Online / Offline / Hybrid."""
    t = text.lower()
    if any(s in t for s in HYBRID_SIGNALS):
        return "Hybrid"
    has_off = any(s in t for s in OFFLINE_SIGNALS)
    has_on = any(s in t for s in ONLINE_SIGNALS)
    if has_off and has_on:
        return "Hybrid"
    if has_off:
        return "Offline"
    if has_on:
        return "Online"
    return "Unknown"


# --- Geocoding ---
# Hardcoded coords for major cities (avoids API rate limits during demo)
CITY_COORDS: dict[str, tuple[float, float]] = {
    "Mumbai": (19.0760, 72.8777), "Delhi": (28.7041, 77.1025),
    "New Delhi": (28.6139, 77.2090), "Bangalore": (12.9716, 77.5946),
    "Bengaluru": (12.9716, 77.5946), "Hyderabad": (17.3850, 78.4867),
    "Chennai": (13.0827, 80.2707), "Kolkata": (22.5726, 88.3639),
    "Pune": (18.5204, 73.8567), "Ahmedabad": (23.0225, 72.5714),
    "Jaipur": (26.9124, 75.7873), "Lucknow": (26.8467, 80.9462),
    "Chandigarh": (30.7333, 76.7794), "Indore": (22.7196, 75.8577),
    "Bhopal": (23.2599, 77.4126), "Kochi": (9.9312, 76.2673),
    "Coimbatore": (11.0168, 76.9558), "Nagpur": (21.1458, 79.0882),
    "Surat": (21.1702, 72.8311), "Gurgaon": (28.4595, 77.0266),
    "Gurugram": (28.4595, 77.0266), "Noida": (28.5355, 77.3910),
    "Guwahati": (26.1445, 91.7362), "Bhubaneswar": (20.2961, 85.8245),
    "Thiruvananthapuram": (8.5241, 76.9366), "Navi Mumbai": (19.0330, 73.0297),
    "Thane": (19.2183, 72.9781), "Mangalore": (12.9141, 74.8560),
    "Mysore": (12.2958, 76.6394), "Visakhapatnam": (17.6868, 83.2185),
}


def geocode(city: str) -> tuple[float | None, float | None]:
    """
    Get lat/lon for a city. Uses hardcoded coords first, then Nominatim fallback.
    """
    if city in CITY_COORDS:
        return CITY_COORDS[city]

    # Fallback: try Nominatim (rate-limited, best-effort)
    try:
        from geopy.geocoders import Nominatim
        geolocator = Nominatim(user_agent="hackplate-ai/3.0")
        location = geolocator.geocode(city, timeout=5)
        if location:
            return (location.latitude, location.longitude)
    except Exception:
        pass

    return (None, None)


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in km using Haversine formula."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
