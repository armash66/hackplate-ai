def detect_food(text: str) -> tuple[bool, list[str], int]:
    """
    Detects food-related keywords in event text using weighted scoring.

    Scoring rules:
    - Tier 1 (score 3): Direct food offers  — "free food", "meals provided", "catered"
    - Tier 2 (score 2): Sponsor-level items — "sponsored", "sponsor", "provided"
    - Tier 3 (score 1): General food words  — "food", "lunch", "dinner", "snacks", "pizza", etc.
    - Bonus +1: If "free" appears near a food word in the same sentence

    Returns:
        (food_detected: bool, matched_keywords: list[str], food_score: int)
    """

    SCORING = {
        # Tier 1 — high confidence
        "free food": 3,
        "meals provided": 3,
        "catered": 3,
        "catering": 3,
        "complimentary meals": 3,
        # Tier 2 — sponsor-level
        "sponsored meals": 2,
        "food sponsor": 2,
        "meal sponsor": 2,
        # Tier 3 — general food mentions
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

    # Bonus: +1 if "free" appears anywhere (amplifies intent signal)
    if "free" in text_lower and matched:
        total_score += 1

    return len(matched) > 0, matched, total_score
