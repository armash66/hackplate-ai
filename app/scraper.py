from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time

BASE_URL = "https://devfolio.co/hackathons"

def get_hackathon_links(page):
    """
    Extracts hackathon links from the Devfolio listing page.
    """
    print(f"Navigating to {BASE_URL}...")
    page.goto(BASE_URL, wait_until="networkidle")
    
    # Scroll a bit to ensure items load if lazy-loaded
    page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
    time.sleep(2)
    
    # Devfolio links follow the pattern: https://[hackathon-slug].devfolio.co/
    hrefs = page.eval_on_selector_all("a[href*='.devfolio.co']", "elements => elements.map(e => e.href)")
    
    # Filter unique links and exclude the base domain and internal subdomains
    exclude_subdomains = ['dashboard.devfolio.co', 'api.devfolio.co', 'auth.devfolio.co']
    unique_links = []
    for link in hrefs:
        # Check if it's a subdomain and not the main domain
        if 'devfolio.co' in link and 'devfolio.co/hackathons' not in link:
            # Check for specific subdomain pattern
            if not any(sub in link for sub in exclude_subdomains) and link.startswith('https://'):
                if link not in unique_links:
                    unique_links.append(link)
    
    return unique_links

def extract_page_content(page, url):
    """
    Visits a hackathon page and extracts its full text content.
    """
    print(f"Scraping: {url}")
    try:
        page.goto(url, wait_until="networkidle")
        # Extract text using BeautifulSoup for cleaner results
        soup = BeautifulSoup(page.content(), "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = soup.get_text(separator=' ')
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Get title
        title = soup.title.string if soup.title else "No Title"
        
        return {
            "title": title.replace(" | Devfolio", "").strip(),
            "url": url,
            "content": clean_text
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def scrape_devfolio(limit=5):
    """
    Main scraping function using Playwright.
    """
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
        page = context.new_page()
        
        links = get_hackathon_links(page)
        print(f"Found {len(links)} hackathons. Visiting top {min(limit, len(links))}...")
        
        for link in links[:limit]:
            data = extract_page_content(page, link)
            if data:
                results.append(data)
        
        browser.close()
    
    return results

if __name__ == "__main__":
    # Test run
    scraped_data = scrape_devfolio(limit=2)
    for item in scraped_data:
        print(f"--- {item['title']} ---")
        print(f"URL: {item['url']}")
        print(f"Content Length: {len(item['content'])}")