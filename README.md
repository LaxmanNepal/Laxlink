# LaxLink

A production-oriented smart-link platform inspired by the problem space of OpenInApp, with an original UI and architecture.

## Stack
- Next.js App Router + React + TypeScript
- PostgreSQL + Prisma
- REST API
- Responsive SaaS dashboard

## Run locally
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`.
4. Run `npx prisma generate` and `npx prisma db push`.
5. Run `npm run dev`.

Open `http://localhost:3000`.

## Current MVP
- Landing page
- Link creation API
- Custom slugs
- PostgreSQL link/event schema
- Redirect engine with click/device tracking
- Responsive dashboard foundation

## Roadmap
Authentication, persistent dashboard creation, QR codes, analytics charts, device/app routing, custom domains, API keys, rate limiting, bot filtering, teams, billing and admin console.