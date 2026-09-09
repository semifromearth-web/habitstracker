# Habit Tracker

A personal habit-tracking app — single-file, no build step, works on GitHub Pages.

## Features
- Daily habit grid with monthly view and per-habit streaks
- Completion trend chart and habit-share donut chart (Progress tab)
- Longest-streak record per habit
- Squad tab — live leaderboard synced through Supabase, so friends can see each other's streaks
- Backup & restore — export/import your data as a `.json` file (your data otherwise lives only in this browser's storage)
- Installable as a home-screen app (PWA)

## Files
- `index.html` — the entire app
- `manifest.json` — PWA metadata (name, icon, theme color)
- `icon.png` — home-screen / favicon icon

## Deploying on GitHub Pages
1. Upload all three files (`index.html`, `manifest.json`, `icon.png`) to the root of this repo.
2. Go to **Settings → Pages** → set Source to this branch, folder `/ (root)` → Save.
3. GitHub gives you a live URL a minute or two later, e.g. `https://yourusername.github.io/habit-tracker/`.

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
