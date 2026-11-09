# KazeMenu

Restaurant order and menu backend + frontend.

## Project layout

- `backend/` Express + Socket.IO API server.
- `frontend/` client app.

## Backend setup

1. Install backend dependencies (from the backend folder):
   - `npm install` or `yarn install` (run in `backend/`).
2. Configure environment variables:
   - `MONGODB_URI` — MongoDB connection string.
   - `PORT` — backend port (default `5000`).
   - `CORS_ORIGIN` — comma-separated allowed frontend origins (default `http://localhost:5173`).
   - `VITE_API_URL` — used for CSP connect source in local dev.
3. Start the backend:
   - `node backend/server.js` or your preferred Node runner.

### Vercel deployment notes

The backend is prepared for serverless runtimes:

- Uploads write to `/tmp/uploads` in production (`NODE_ENV === 'production'`).
- Local development still writes to the backend `uploads/` folder.
- Startup tries to create the upload folder safely, and falls back instead of crashing if the environment is read-only.
- MongoDB is connected lazily through `connectDB` / `getDbReady`. Do not top-level await a new connection outside route/socket handlers.
- Use the exact environment variable name `MONGODB_URI` when configuring the deployed environment.

### API routes

- `GET /` — server readiness probe.
- `GET /api/health` — API + DB readiness probe.
- `POST /api/auth/...` — authentication endpoints.
- `POST /api/uploads/...` — file uploads.
- Other API groups: restaurant, public restaurants, menu categories, menu items, tables, orders.

### Socket.IO

- Restaurant-scoped rooms exist under `restaurant-<restaurantId>`.
- WebSocket auth reads the `kazemenu_token` cookie and validates restaurant membership.

## Frontend setup

- Install frontend dependencies from the frontend folder.
- Configure the API base URL to point at the running backend.
- Run the frontend dev server per its own tooling.

## Runtime constraints

- In serverless environments, prefer the writable `/tmp/uploads` path for uploads.
- Do not assume a persistent local uploads folder survives in production.
- Keep `MONGODB_URI` set in the deployed environment; the backend will throw if it is missing.
