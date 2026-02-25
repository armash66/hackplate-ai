# 🚀 HackPlate v1

HackPlate is a modular system built to scrape hackathon listings and detect food-related perks (because free pizza is the best part of any hackathon).

## 🎯 Objective
Build a solid foundation for hackathon perk detection.
- Scrapes Devfolio using Playwright.
- Keywords-based food detection.
- Clean, modular architecture.

## 🧱 Project Structure
```
hackplate/
│
├── app/
│   ├── scraper.py     # Playwright-based scraper
│   ├── detector.py    # Food-perk detection engine
│   ├── main.py        # Integration & runner
│
├── requirements.txt
├── .gitignore
└── README.md
```

## 🛠️ Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install Playwright browser:
   ```bash
   playwright install chromium
   ```

## 🚀 Usage
Run the main script to fetch the latest hackathons and check for food:
```bash
python app/main.py
```

## ✅ Definition of Done (v1)
- [x] Scrape Devfolio listing page.
- [x] Extract content from top 5 events.
- [x] Detect food keywords (pizza, snacks, etc.).
- [x] Structured terminal output.
- [x] Modular project structure.