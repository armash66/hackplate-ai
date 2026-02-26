from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time
from .base import BaseScraper, RawEvent


class DevfolioScraper(BaseScraper):
    BASE_URL = "https://devfolio.co/hackathons"

    def scrape(self, limit: int = 10) -> list[RawEvent]:
        results = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                           "AppleWebKit/537.36 (KHTML, like Gecko) "
                           "Chrome/119.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            # Get hackathon links
            links = self._get_links(page)
            print(f"  [devfolio] Found {len(links)} hackathons. Scraping top {min(limit, len(links))}...")

            for url in links[:limit]:
                event = self._extract(page, url)
                if event:
                    results.append(event)

            browser.close()
        return results

    def _get_links(self, page) -> list[str]:
        print(f"  [devfolio] Navigating to {self.BASE_URL}...")
        page.goto(self.BASE_URL, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
        time.sleep(2)

        hrefs = page.eval_on_selector_all(
            "a[href*='.devfolio.co']",
            "elements => elements.map(e => e.href)"
        )

        exclude = ["dashboard.devfolio.co", "api.devfolio.co", "auth.devfolio.co"]
        unique = []
        for link in hrefs:
            if "devfolio.co" in link and "devfolio.co/hackathons" not in link:
                if not any(sub in link for sub in exclude) and link.startswith("https://"):
                    if link not in unique:
                        unique.append(link)
        return unique

    def _extract(self, page, url: str) -> RawEvent | None:
        print(f"  [devfolio] Scraping: {url}")
        try:
            page.goto(url, wait_until="networkidle")
            soup = BeautifulSoup(page.content(), "html.parser")

            for tag in soup(["script", "style"]):
                tag.decompose()

            text = soup.get_text(separator=" ")
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean = "\n".join(c for c in chunks if c)

            title = soup.title.string if soup.title else "No Title"
            title = title.replace(" | Devfolio", "").strip()

            return RawEvent(
                title=title,
                description=clean,
                url=url,
                location_text=clean,  # location engine will parse this
                start_date=None,
                source="devfolio",
            )
        except Exception as e:
            print(f"  [devfolio] Error: {e}")
            return None
