# Frontend (React + TypeScript + Vite)

## Purpose
- Functional UI for App Gestion modules:
   - Dashboard and KPIs
   - Projects
   - Consultants
   - Time entries workflow (approve/reject)
   - Expenses
   - Forecasts
- Connects to backend API via `VITE_API_URL`.
- Uses orange brand style tokens and responsive layout.

## Local quick start
1. Install dependencies:
   - `npm install`
2. Set environment variable:
   - Create `.env` from `.env.example`
3. Run app:
   - `npm run dev`

## Build and run
- `npm run build`
- `npm run start` (serves built files using `server.mjs`)

## Railway
- Configure `VITE_API_URL` with backend public domain.
- Redeploy frontend after changing `VITE_API_URL`.
- If using Dockerfile builder:
   - Dockerfile path: `frontend/Dockerfile`
   - Ensure `VITE_API_URL` is available at build time.
