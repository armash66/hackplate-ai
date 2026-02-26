from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RawEvent:
    """Normalized event schema from any scraper."""
    title: str
    description: str
    url: str
    location_text: str
    start_date: str | None
    source: str


class BaseScraper(ABC):
    """Interface for all scrapers."""

    @abstractmethod
    def scrape(self, limit: int = 10) -> list[RawEvent]:
        """Scrape events and return normalized list."""
        pass
