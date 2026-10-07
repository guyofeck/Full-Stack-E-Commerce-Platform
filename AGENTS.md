# Agent notes

## Running (Base44 sandbox)
- `docker compose -f docker-compose.base44.yml up -d` — runs from source (`src/client` Next.js dev, `src/server` nodemon+ts-node), Postgres 15, Redis 7. Ignore `src/docker-compose.yml` and the Dockerfiles (they bake source / need `src/.env`).
- `server-setup` one-shot does `npm ci`, `prisma generate`, `prisma migrate deploy`. Seed is NOT automatic and is destructive (wipes all tables): `docker compose -f docker-compose.base44.yml exec -T server npm run seed`.
- Seed logins: `user@example.com` / `admin@example.com` / `superadmin@example.com`, password `password123`.

## Wiring quirks
- Auth uses cookies (SameSite=lax in dev), so the browser must stay on one origin: client gets `NEXT_PUBLIC_API_URL_DEV=/api/v1` and `next.config.ts` rewrites `/api/v1/*` to `API_PROXY_TARGET` (only active when that env var is set).
- Socket.IO chat connects directly to the API's public port 5000 (`NEXT_PUBLIC_SOCKET_URL`); CORS for both REST and sockets comes from `ALLOWED_ORIGINS`.
- Passport strategies (Google/Facebook/Twitter) and Stripe throw at boot if their keys are empty, so those secrets must exist (placeholders are fine for booting; the features need real keys).
- Server log says "Neon Database connected" regardless of the actual DB — it's just a hardcoded message.

## Verify
- `curl localhost:3000/` → 200; `curl localhost:3000/api/v1/products` → JSON; `curl localhost:5000/health`.
- The home page reads GraphQL, not the REST product list. Verify `/api/v1/graphql` through port 3000 with `query { products(first:100) { products { name isFeatured isTrending isNew isBestSeller variants { price stock } } } }` to confirm its actual data path.
- The sandbox database already contains 10 demo products spanning all four home-page sections; preserve them rather than rerunning the destructive seed. Demo variants currently have no photos, so cards use the existing generated placeholders.
