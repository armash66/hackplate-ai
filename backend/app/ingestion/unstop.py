import requests
from bs4 import BeautifulSoup
from .base import BaseScraper, RawEvent


class UnstopScraper(BaseScraper):
    """Scrape public hackathon listings from Unstop."""
    BASE_URL = "https://unstop.com/hackathons"

    def scrape(self, limit: int = 10) -> list[RawEvent]:
        results = []
        try:
            print(f"  [unstop] Fetching {self.BASE_URL}...")
            resp = requests.get(self.BASE_URL, timeout=15, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Unstop uses card-based layout. Links follow /hackathons/slug-id pattern.
            links = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "/hackathons/" in href and href not in links:
                    if not href.startswith("http"):
                        href = "https://unstop.com" + href
                    links.append(href)

            print(f"  [unstop] Found {len(links)} listings. Scraping top {min(limit, len(links))}...")

            for url in links[:limit]:
                event = self._extract(url)
                if event:
                    results.append(event)

        except Exception as e:
            print(f"  [unstop] Error: {e}")

        return results

    def _extract(self, url: str) -> RawEvent | None:
        try:
            print(f"  [unstop] Scraping: {url}")
            resp = requests.get(url, timeout=15, headers={
                "User-Agent": "Mozilla/5.0"
            })
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for tag in soup(["script", "style"]):
                tag.decompose()

            text = soup.get_text(separator=" ")
            title = soup.title.string if soup.title else "No Title"
            title = title.replace(" - Unstop", "").replace("| Unstop", "").strip()

            return RawEvent(
                title=title,
                description=text[:5000],
                url=url,
                location_text=text,
                start_date=None,
                source="unstop",
            )
        except Exception as e:
            print(f"  [unstop] Error scraping {url}: {e}")
            return None
