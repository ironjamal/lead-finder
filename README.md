# Lead Finder

A simple tool to search local businesses on Google Maps and quickly spot the
ones that don't have a website listed in their Google Business data.

**What it does:** Search → find businesses → filter "no website" → save leads → export CSV.
That's it — no accounts, no database, no dashboards.

## 1. Install

```bash
npm install
```

## 2. Add your Google API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create (or select) a project.
2. Enable the **Places API (New)**.
3. Create an API key under **APIs & Services → Credentials**.
4. (Recommended) Restrict the key to the Places API and, if possible, to your server's IP.
5. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

6. Open `.env.local` and paste your key:

   ```
   GOOGLE_PLACES_API_KEY=your_actual_key_here
   ```

The key is only ever used on the server (inside `src/app/api/search/route.ts`)
and is never sent to the browser.

## 3. Run the project

Development:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm start
```

## 4. How to use the tool

1. Enter a **business type** (e.g. "Dentist", "Restaurant", "Gym").
2. Enter a **location** (e.g. "Riyadh, Saudi Arabia").
3. Pick how many results you want (20 / 50 / 100).
4. Click **Find Leads**.
5. Use the **All / No Website / Website Listed** filter to narrow the list.
6. For any business marked "No Website Listed", click **Save Lead** to keep
   it in your browser's local storage (no server or database involved).
7. Click **Saved Leads** (top right) to view everything you've saved.
8. Click **Export CSV** inside the Saved Leads panel to download a CSV file
   with all saved leads.

## Notes on accuracy

Google Places data is not guaranteed to be complete. "No Website Listed"
means Google's data does not include a website for that business — it does
not guarantee the business has no website at all. Treat it as a lead signal,
not a verified fact.

## Project structure

```
src/
  app/
    api/search/route.ts   # Server-side route that calls the Google Places API
    page.tsx               # Main page (search form + results)
    layout.tsx              # Root layout
    globals.css              # Tailwind + base styles
  components/
    SearchForm.tsx          # Search form (business type, location, count)
    FilterBar.tsx           # All / No Website / Website Listed filter
    BusinessCard.tsx        # Single business result card
    SavedLeadsPanel.tsx     # Saved leads modal + CSV export
    StatusBadge.tsx         # Small "Website Listed / No Website / Unknown" badge
  lib/
    googlePlaces.ts         # Google Places API (New) integration
    csv.ts                   # CSV generation + download helper
    savedLeads.ts            # localStorage read/write for saved leads
    types.ts                  # Shared TypeScript types
```

Everything is plain Next.js/React/TypeScript — feel free to edit any file
directly to change behavior or styling.
