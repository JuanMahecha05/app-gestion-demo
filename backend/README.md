# Backend (Node.js + TypeScript)

## Stack
- Fastify
- Prisma
- PostgreSQL (Railway)

## Functional modules
- Projects (`/api/projects`)
- Consultants (`/api/consultants`)
- Time entries with approval workflow (`/api/time-entries`)
- Expenses (`/api/expenses`)
- Forecasts (`/api/forecasts`)
- Dashboard overview metrics (`/api/stats/overview`)

## Local quick start
1. Install dependencies:
   - `npm install`
2. Set `DATABASE_URL` in `.env` with a reachable Postgres URL
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Sync schema to database:
   - `npm run prisma:push`
5. (Optional) Seed demo data:
   - `npm run prisma:seed`
6. Start API:
   - `npm run dev`

## Validation and status rules
- Project `endDate` must be after `startDate`.
- Currency fields require 3-letter ISO format (example: `USD`).
- Time entries can only move from `PENDING` to `APPROVED` or `REJECTED`.
- Rejection requires a note.
- Forecast period must use `YYYY-Qn` format.
- Stats endpoint validates date ranges (`to` cannot be before `from`).

## Railway deploy (API)
1. Root directory:
   - `backend`
2. Build command:
   - `npm run build`
3. Start command:
   - `npm run railway:start`
4. Variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://<frontend-domain>,https://<optional-custom-domain>`
   - `DATABASE_URL=<railway-postgres-url>`

`railway:start` now runs Prisma client generation + `prisma db push` and then starts the API.
This ensures required tables are created in Railway before serving traffic.

If you need to apply migrations in Railway, run:
- `npm run railway:migrate`

## Health and readiness
- `GET /health`:
   - Returns `200` when DB is reachable.
   - Returns `503` when DB is down.

## Notes
- The repository deploys backend from root using `railway.toml` + `Dockerfile`.
- Frontend deploy is a separate Railway service using root directory `frontend`.

## Smoke test (E2E-lite)
With API running locally or deployed, execute:
- `npm run smoke`

To run against Railway:
- `API_BASE_URL=https://<your-backend-domain>.up.railway.app npm run smoke`

## Available scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:push`
- `npm run prisma:seed`
- `npm run prisma:deploy`
- `npm run prisma:studio`
- `npm run railway:start`
- `npm run smoke`
