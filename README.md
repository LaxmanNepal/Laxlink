# LaxLink

Full-stack smart-link infrastructure for branded short URLs, device routing, QR codes and analytics. Original product design inspired by the smart-link problem space, not a copy of any third-party UI.

## Included now
- Next.js App Router + React + TypeScript
- PostgreSQL + Prisma production schema
- Persistent link creation/list/update/delete APIs
- Custom slugs and link titles
- Device-aware redirect engine
- Android/iOS destination fields and prioritized smart rules
- Click event tracking with device/referrer/user-agent
- Bot detection and exclusion from human click totals
- Analytics aggregation API
- QR-code SVG API
- API-key generation/storage foundation
- Custom-domain verification data model
- Responsive SaaS dashboard with QR/analytics actions
- Health endpoint
- Dockerfile
- GitHub Actions CI

## Local setup
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to PostgreSQL.
4. Run `npm install`.
5. Run `npm run db:generate`.
6. Run `npm run db:push`.
7. Run `npm run dev`.

## API
`POST /api/links` creates a link.
`GET /api/links` lists links.
`PATCH /api/links/:slug` updates a link.
`DELETE /api/links/:slug` deletes a link.
`GET /r/:slug` performs the smart redirect.
`GET /api/analytics?slug=...` returns analytics aggregates.
`GET /api/qr?url=...` returns an SVG QR code.
`POST /api/keys` creates an API key (store the returned secret safely).
`GET /api/health` checks application/database health.

## Production next steps
Set up managed PostgreSQL/Redis, authentication provider, API-key authorization middleware, distributed rate limiting, DNS/domain verification, background analytics aggregation, billing, abuse controls and app-specific universal/app-link association files before public high-volume launch.
