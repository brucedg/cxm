# CXM

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Neon Postgres (serverless)
- Deployed on Vercel

## Structure
- `app/` — Next.js App Router pages and API routes
- `lib/` — shared utilities (db, etc.)
- `public/` — static assets

## Development
- `npm run dev` — runs on port 3008
- `npm run build` — production build

## Database
- Neon Postgres via `@neondatabase/serverless`
- Connection string in `.env.local` as `DATABASE_URL`
- Use `getDb()` from `lib/db.ts` for queries

## Conventions
- Inline styles (no CSS framework)
- Server components by default, `'use client'` only when needed
- API routes in `app/api/`
