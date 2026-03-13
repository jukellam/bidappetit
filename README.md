# BidAppetit

A two-sided marketplace connecting event planners with restaurants. Planners post events, restaurants browse and bid, planners accept the best bid to create a booking.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Vite, React Router

## Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Setup

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd frontend
npm install
```

## Running

Start both servers in separate terminals:

**Backend** (runs on http://localhost:8000):

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**Frontend** (runs on http://localhost:5173):

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

The database is created and seeded automatically on first run. Delete `backend/database.db` to reset.

## Demo Walkthrough

The app comes pre-seeded with demo data so you can explore immediately.

### As an Event Planner

1. Open the app and select **Sarah Chen** (planner) from the login screen
2. You'll see the dashboard with your events and their bid counts
3. Click **Corporate Holiday Party** — it has 2 bids waiting
4. Review the bids side-by-side using the **Compare Bids** button
5. Click **Accept Bid** on your preferred restaurant
6. Check **My Bookings** to see the confirmed booking
7. Try **Create Event** to post a new event with the 3-step form

### As a Restaurant

1. Log out and select **El Jardin** (restaurant) from the login screen
2. The dashboard shows events in your city (Chicago)
3. Click **Browse Events** to see all open events with filters
4. Click an event to see full details, then **Submit a Bid**
5. Fill in your price and proposal, then submit
6. Check **My Bids** to track all your submitted bids

### Full Flow

1. Log in as a planner → Create Event
2. Log in as a restaurant → Browse Events → Submit Bid
3. Log in as the planner again → View bids → Accept one
4. Both sides see the confirmed booking

## Seed Data

| Type | Count | Details |
|------|-------|---------|
| Planners | 3 | Sarah Chen, Marcus Johnson, Elena Rodriguez |
| Restaurants | 5 | Italian, Japanese, Mexican, Steakhouse, French across SF and Chicago |
| Events | 6 | 2 open (no bids), 2 open (with bids), 1 booked, 1 cancelled |
| Bids | 7 | Spread across events with realistic proposals |
| Bookings | 1 | Executive Team Building Dinner at Le Petit Bistro |

## API Documentation

FastAPI auto-generates interactive API docs at http://localhost:8000/docs when the backend is running.

## Project Structure

```
bidappetit/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan, CORS
│   │   ├── database.py          # SQLAlchemy engine and session
│   │   ├── dependencies.py      # Auth and DB dependencies
│   │   ├── seed.py              # Demo data
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── routers/             # API route modules
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Routes and auth state
│   │   ├── api/client.ts        # API client with auth headers
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── components/          # Layout, Navbar
│   │   └── pages/               # Planner and restaurant pages
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
