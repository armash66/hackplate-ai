from scraper import scrape_devfolio
from detector import detect_food

def main():
    print("🚀 HackPlate v1 — Starting Scrape")
    print("==============================")
    
    # Fetch hackathons and extract content (Scraper handles visiting top 5)
    hackathons = scrape_devfolio(limit=5)
    
    found_any = False
    for event in hackathons:
        food_detected, keywords = detect_food(event['content'])
        
        if food_detected:
            found_any = True
            print("\n🍕 Food Found!")
            print(f"Title: {event['title']}")
            print(f"URL: {event['url']}")
            print(f"Matched Keywords: {', '.join(keywords)}")
            print("==============================")
        else:
            print(f"Skipping: {event['title']} (No food perks detected)")

    if not found_any:
        print("\n😔 No food perks found in the latest 5 hackathons.")
    
    print("\nHackPlate v1 run complete.")

if __name__ == "__main__":
    main()
