def detect_food(text: str) -> tuple[bool, list[str], int]:
    """
    Detects food-related keywords in event text using weighted scoring.

    Tiers:
        Tier 1 (3 pts): Direct food offers  - "free food", "meals provided", "catered"
        Tier 2 (2 pts): Sponsor signals      - "sponsored meals", "food sponsor"
        Tier 3 (1 pt):  General food words   - "food", "lunch", "dinner", "pizza", etc.
        Bonus  (+1):    "free" appears alongside any food keyword
        Bonus  (+1):    Event is 24h+ (detected via "24 hour", "overnight")

    Returns:
        (food_detected, matched_keywords, food_score)
    """
    SCORING = {
        # Tier 1
        "free food": 3,
        "meals provided": 3,
        "catered": 3,
        "catering": 3,
        "complimentary meals": 3,
        # Tier 2
        "sponsored meals": 2,
        "food sponsor": 2,
        "meal sponsor": 2,
        "corporate sponsor": 2,
        # Tier 3
        "food": 1,
        "lunch": 1,
        "dinner": 1,
        "breakfast": 1,
        "snacks": 1,
        "pizza": 1,
        "refreshments": 1,
        "beverages": 1,
        "drinks": 1,
        "coffee": 1,
    }

    text_lower = text.lower()
    matched = []
    total_score = 0

    for keyword, score in SCORING.items():
        if keyword in text_lower and keyword not in matched:
            matched.append(keyword)
            total_score += score

    # Bonus: "free" amplifies intent
    if "free" in text_lower and matched:
        total_score += 1

    # Bonus: 24hr+ events almost always have food
    duration_signals = ["24 hour", "24-hour", "overnight", "36 hour", "48 hour"]
    if any(sig in text_lower for sig in duration_signals) and matched:
        total_score += 1

    return len(matched) > 0, matched, total_score
