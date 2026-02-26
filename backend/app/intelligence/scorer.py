def compute_score(food_score: int, description: str) -> int:
    """
    Compute combined event relevance score.

    Formula: food_score + hackathon_relevance + sponsor_bonus + duration_bonus

    Returns integer score (higher = more relevant).
    """
    score = food_score
    text = description.lower()

    # Hackathon relevance signals
    relevance_keywords = ["hackathon", "hack", "build", "code", "dev", "project"]
    relevance_hits = sum(1 for k in relevance_keywords if k in text)
    score += min(relevance_hits, 3)  # cap at 3

    # Sponsor quality bonus
    sponsor_signals = ["mlh", "devfolio", "github", "google", "microsoft",
                       "aws", "azure", "polygon", "ethereum", "solana"]
    sponsor_hits = sum(1 for s in sponsor_signals if s in text)
    score += min(sponsor_hits, 3)  # cap at 3

    # Duration bonus (longer events = more food likely)
    if any(w in text for w in ["48 hour", "36 hour", "3 day", "weekend"]):
        score += 2
    elif any(w in text for w in ["24 hour", "overnight", "2 day"]):
        score += 1

    # Prize pool bonus (well-funded = better food)
    if any(w in text for w in ["prize pool", "prizes worth", "cash prize"]):
        score += 1

    return score
