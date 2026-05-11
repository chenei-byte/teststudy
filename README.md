# Study Organizer (Next.js + Vercel)

A simple study task tracker. **No login required.** Tasks are saved in each
visitor's browser using `localStorage`, so progress stays on their own device.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this folder to GitHub.
2. In Vercel: **New Project** → import the repo (Next.js is auto-detected).
3. Click **Deploy**.

There are no environment variables and no database to set up.

## Notes

- Tasks live in the browser only (`localStorage`). Different devices/browsers
  do not share data.
- Clearing browser data will erase tasks.
