# HackPlate

A modular system that scrapes hackathon listings, detects food-related perks, scores them by relevance, persists results, and sends notifications.

---

## Overview

HackPlate was built to solve a simple problem: finding hackathons that actually feed you. Rather than manually browsing listings, HackPlate automates the entire pipeline — from scraping event pages to alerting you when food perks are detected.

The architecture is intentionally modular. Each concern lives in its own module, making the system easy to extend with new sources, scoring logic, or notification channels.

---

## Features

- **Playwright Scraper** — Handles JavaScript-rendered pages on Devfolio. Extracts event titles, URLs, and full page text.
- **Food Scoring Engine** — Tier-based keyword detection that returns a relevance score alongside matched terms. Not a simple boolean.
- **SQLite Persistence** — Stores detected events locally. Deduplicates by URL hash so the same event is never saved or re-notified twice.
- **Telegram Notifications** — Sends a formatted message to a configured Telegram bot when a food event is found.

---

## Project Structure

```
hackplate/
│
├── app/
│   ├── scraper.py       # Playwright-based Devfolio scraper
│   ├── detector.py      # Tiered food keyword scoring engine
│   ├── database.py      # SQLite storage and deduplication
│   ├── notifier.py      # Telegram alert integration
│   └── main.py          # Entry point — orchestrates the pipeline
│
├── hackplate.db         # Auto-generated SQLite database (gitignored)
├── requirements.txt
├── .env                 # Secrets — not committed (see Configuration)
├── .gitignore
└── README.md
```

---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/hackplate-ai.git
cd hackplate-ai
```

**2. Install Python dependencies**

```bash
pip install -r requirements.txt
```

**3. Install the Playwright browser**

```bash
playwright install chromium
```

---

## Configuration

Create a `.env` file in the project root. Telegram credentials are optional — the system will skip notifications and log a warning if they are absent.

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

To get these values:
- Create a bot via [@BotFather](https://t.me/BotFather) on Telegram.
- Use [@userinfobot](https://t.me/userinfobot) to retrieve your chat ID.

---

## Usage

```bash
python app/main.py
```

**Example output:**

```
========================================
  HackPlate v1.5 - Food Intelligence
========================================
Navigating to https://devfolio.co/hackathons...
Found 31 hackathons. Visiting top 5...

Scraping: https://campfire-hackathon.devfolio.co/

========================================
Food Detected!
   Title    : Campfire Hackathon
   URL      : https://campfire-hackathon.devfolio.co/
   Keywords : food, refreshments
   Score    : 3
   Saved to database.
   Telegram alert sent.
========================================

HackPlate v1.5 run complete.
```

---

## Scoring Logic

The detector uses a tiered scoring system:

| Tier | Examples | Points |
|------|----------|--------|
| 1 — High confidence | "free food", "meals provided", "catered" | 3 |
| 2 — Sponsor signals | "food sponsor", "sponsored meals" | 2 |
| 3 — General mentions | "food", "pizza", "snacks", "lunch" | 1 |
| Bonus | "free" appears alongside any food keyword | +1 |

A higher score indicates stronger evidence that food will actually be provided, not just mentioned in passing.

---

## Roadmap

| Version | Features |
|---------|----------|
| v1 | Devfolio scraper, keyword detection, structured output |
| v1.5 | Scoring engine, SQLite storage, Telegram notifications |
| v2 | Multi-source (Unstop, HackerEarth), scheduler |
| v3 | Semantic detection via LLM |

---

## Requirements

```
playwright
beautifulsoup4
requests
python-dotenv
```

---

## License

MIT