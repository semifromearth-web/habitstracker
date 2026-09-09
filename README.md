# Habit Tracker

A personal habit-tracking app — single-file, no build step, works on GitHub Pages.

## Features
- Daily habit grid with monthly view and per-habit streaks
- Completion trend chart and habit-share donut chart (Progress tab) — hand-drawn on canvas, no external library, works fully offline
- Longest-streak record per habit
- Squad tab — live leaderboard synced through Supabase, so friends can see each other's streaks
- Backup & restore — export/import your data as a `.json` file (your data otherwise lives only in this browser's storage)
- Daily reminder notification if habits aren't logged by a set time (only while the app is open in a tab or installed and running — see note below)
- Installable as a home-screen app (PWA), works offline via a service worker

## Files
- `index.html` — the entire app
- `manifest.json` — PWA metadata (name, icon, theme color)
- `icon.png` — home-screen / favicon icon
- `sw.js` — service worker that caches the app shell so it loads offline

## Deploying on GitHub Pages
1. Upload all four files (`index.html`, `manifest.json`, `icon.png`, `sw.js`) to the root of this repo.
2. Go to **Settings → Pages** → set Source to this branch, folder `/ (root)` → Save.
3. GitHub gives you a live URL a minute or two later, e.g. `https://yourusername.github.io/habit-tracker/`.

## Offline use
The service worker (`sw.js`) caches the app's own files (`index.html`, `manifest.json`, `icon.png`) the first time you load it, so it opens with no connection after that. Checking off habits and editing settings all work offline — they're saved to this browser's local storage. Squad sync (Supabase) needs a connection; if you're offline it just fails quietly and retries next time you're online, or you can tap the Refresh button on the Squad tab. When your connection comes back, the app auto-syncs and shows a toast.

## Daily reminder
Settings → Daily Reminder lets you set a time; if any habits are still unchecked by then, you get a browser notification. This only works while the app is open in a tab, or installed as a PWA and running in the background — a fully closed browser/app won't fire it, since real background push notifications need a server component this static site doesn't have.

## Squad sync (Supabase)
The Squad tab pushes/pulls progress through a Supabase table called `squad`. This repo is public, so the Supabase anon key inside `index.html` is visible to anyone. Row Level Security (RLS) is what keeps that safe:

- **SELECT** — public, so the leaderboard is readable by anyone with the link
- **INSERT** / **UPDATE** — allowed, but constrained by a check so only sane values get written:
  ```sql
  char_length(username) between 1 and 30
  and pct between 0 and 100
  and streak >= 0
  ```
- **DELETE** — no policy at all, so rows can never be deleted through the API

This doesn't stop someone from overwriting your row if they know your username (no login system exists), but it does stop garbage data and wipes. Adding real per-user auth would close that last gap, but is probably overkill for a small friend group.

## Editing habits
Open the app → Settings tab → edit the list → Save. Changing your name isn't supported from the UI; it's tied to your browser's local storage under that name.
