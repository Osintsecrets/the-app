# The App — Personal OSINT & News Dashboard (PWA)

Installable, offline-ready, static site hosted on GitHub Pages. A GitHub Action fetches multiple RSS/Atom feeds, normalizes them, and writes `/data/feeds.json`. The UI renders that JSON with filters, tabs, and a luxe glass/aurora design.

## Features
- **Feeds page** with tabs (All/OSINT/News), search, time window (24h/7d/30d), cards/list layouts, reload.
- **Dashboard** quick “Today” view with density/layout/topic/star toggles.
- **Bookmarks** hub powered by `/data/bookmarks.json` (+ search, sort).
- **PWA**: Installable, offline cache, theme toggle (dark/AMOLED).
- **Data pipeline**: GitHub Action runs every 30min (and manually) to refresh feeds.

## Setup
1. Install dependencies: `npm install`
2. Serve the site locally with any static server (e.g., `npx serve`).
3. Open the printed URL in your browser.

## Edit sources
Add/modify feed sources in `/data/sources.json`:
```json
{ "name":"r/OSINT (Reddit)","topic":"OSINT","type":"rss","url":"https://www.reddit.com/r/OSINT/.rss" }
```
Run `npm run fetch:feeds` to regenerate `data/feeds.json` after editing sources.
