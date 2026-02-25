def detect_food(text: str) -> tuple[bool, list[str]]:
    """
    Detects food-related keywords in a given text.
    Returns a tuple: (True/False, list of matched keywords)
    """
    keywords = [
        "food",
        "lunch",
        "dinner",
        "snacks",
        "pizza",
        "refreshments",
        "beverages"
    ]
    
    text_lower = text.lower()
    matched = [kw for kw in keywords if kw in text_lower]
    
    return len(matched) > 0, matched
