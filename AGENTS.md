# Development Notes (Base44)

## Architecture
- **Frontend**: Next.js 15 (App Router) at `src/client/`, served on port 3000
- **Backend**: Express + TypeScript at `src/server/`, served on port 5000
- **Database**: PostgreSQL 15 with Prisma ORM (81 migrations)
- **Cache**: Redis 7

## Running locally
```bash
docker compose -f docker-compose.base44.yml up -d
```

After first boot, run migrations and seed:
```bash
docker compose -f docker-compose.base44.yml exec server npx prisma migrate deploy
docker compose -f docker-compose.base44.yml exec server npm run seed
```

## Key details
- The server uses `module-alias` with `@/` pointing to `src/` (dev) or `dist/` (prod)
- nodemon runs `ts-node -r module-alias/register src/server.ts`
- Next.js uses `next/dynamic` for client-only components (SSR bailout is expected)
- The client talks to the API via `NEXT_PUBLIC_API_URL_DEV` env var
- CORS on the server is controlled by `ALLOWED_ORIGINS` env var

## Test accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@example.com | password123 |
| Admin | admin@example.com | password123 |
| User | user@example.com | password123 |

## External services (placeholders for now)
- Stripe (checkout) — needs real keys for payment flow
- Cloudinary (product images) — needs real keys for image uploads
- Google/Facebook/Twitter OAuth — needs real keys for social login
- SMTP — needs real credentials for email sending
