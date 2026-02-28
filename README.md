# HackPlate -- Student Event Intelligence Platform

HackPlate is a full-stack SaaS platform designed to solve a specific problem for students: finding hackathons that offer food, travel reimbursements, and high-quality experiences.

Instead of manually browsing multiple hackathon listing sites, HackPlate aggregates events, uses keyword-based intelligence to score them, extracts location data, and provides a centralized dashboard and alert system.

## 🚀 Features

- **Multi-Source Ingestion:** Automatically scrapes events from platforms like Devfolio and Unstop.
- **Food Intelligence Engine:** Tiered scoring system that detects direct food offers, sponsor signals, and duration-based likelihoods.
- **Location-Aware:** Extracts event cities and provides geo-radius search using the Haversine formula (e.g., "Find events within 50km of Mumbai").
- **Real-Time Alerts:** Users can create custom notification rules (location, radius, minimum score) and receive instant Telegram alerts when matching events are found.
- **Analytics Dashboard:** Visual insights into event trends, top cities, and platform activity.
- **Saved Events:** Users can bookmark high-value events to their profile.
- **Interactive Map:** Leaflet-powered map visualizing event density and food availability.

## 🏗️ Architecture

HackPlate uses a modern, layered SaaS architecture:

- **Frontend:** Next.js (React), Tailwind CSS, Chart.js, Leaflet
- **Backend:** FastAPI (Python), SQLAlchemy, Pydantic
- **Database:** PostgreSQL (via Supabase) or local SQLite
- **Auth:** Clerk Authentication Engine
- **Ingestion:** Playwright and BeautifulSoup4
- **Notifications:** Telegram Bot API

### Project Structure
```text
hackplate-ai/
├── backend/
│   ├── app/
│   │   ├── analytics/       # API: Dashboard stats & charts
│   │   ├── auth/            # API: JWT login & registration
│   │   ├── events/          # API: Geo-search, filtering, saving
│   │   ├── ingestion/       # Scrapers (Devfolio/Unstop) & runner
│   │   ├── intelligence/    # Food scoring, geocoding & Haversine
│   │   └── notifications/   # Rules CRUD & matching engine
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── app/             # Next.js Pages (Dashboard, Map, Search, Alerts)
    │   └── lib/             # Axios API client & interceptors
    ├── package.json         # Node.js dependencies
    └── tailwind.config.js   # Styling configuration
```

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database (Supabase recommended)
- Telegram Bot Token (via BotFather)

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com).
2. Copy your PostgreSQL Connection String (Session mode).

### 2. Backend Setup
```bash
cd backend

# Install dependencies globally (Virtual Environments are not required!)
pip install -r requirements.txt
pip install psycopg2-binary  # Required for Windows Supabase connection

# Install Playwright browsers (for Devfolio scraper)
playwright install chromium
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=sqlite:///./hackplate.db # Or your Supabase connection string

# Security (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```
Create a `.env.local` file in the `frontend/` directory to pass the public key to Next.js:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
```

## 🚀 Running the Platform

You need to run both the backend and frontend simultaneously.

**Start the Backend (FastAPI):**
```bash
cd backend
uvicorn app.main:app --reload
```
The API will run at `http://localhost:8000`. Swagger UI is available at `http://localhost:8000/docs`.

**Start the Frontend (Next.js):**
```bash
cd frontend
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

## 🧠 Intelligence Scoring Logic

The platform assigns a `relevance_score` to each event based on:

1. **Food Tiers (0-3 pts):** Explicit offers ("catered", "free food") score higher than general mentions ("snacks", "pizza").
2. **Hackathon Relevance (0-3 pts):** Keywords indicating active building.
3. **Sponsor Density (0-3 pts):** Mentions of major tech sponsors (MLH, Devfolio, Google, etc.).
4. **Duration Bonus (1-2 pts):** 24hr+ and 48hr+ events are more likely to provide full catering.

## 📝 Usage

1. **Create an Account:** Register via the frontend.
2. **Trigger Ingestion:** Click "Run Scraper" on the dashboard to populate the database.
3. **Set Up Alerts:** Go to the Alerts page, define your city, search radius, and minimum score threshold.
4. **Receive Notifications:** The backend matching engine will automatically alert your Telegram when a matching hackathon is found.