# DevTrack Pro

> Enterprise Project & Task Management Platform

A production-quality SaaS application for individuals and teams to manage projects, tasks, deadlines, and collaboration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js 20 + Express 5 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | JWT (Access 15m + Refresh 7d) |
| Deployment | Vercel (FE) · Render (BE) · Neon (DB) |

---

## Project Structure

```
devtrack-pro/
├── client/     ← React + Vite frontend
└── server/     ← Node.js + Express backend
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- A [Neon](https://neon.tech) PostgreSQL database

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/devtrack-pro.git
cd devtrack-pro
```

---

### 2. Setup the Server

```bash
cd server
cp .env.example .env
# Fill in your DATABASE_URL and JWT secrets in .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Server runs at: `http://localhost:5000`

---

### 3. Setup the Client

```bash
cd client
cp .env.example .env
# Fill in VITE_API_URL in .env
npm install
npm run dev
```

Client runs at: `http://localhost:5173`

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `7d`) |
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api/v1`) |

---

## Available Scripts

### Server

| Script | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server in production mode |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed development data |
| `npm run db:reset` | Reset DB and re-seed |

### Client

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

- **Frontend** → Push `client/` to Vercel. Set `VITE_API_URL` in Vercel environment variables.
- **Backend** → Push `server/` to Render. Set all server env vars in Render dashboard.
- **Database** → Provision a PostgreSQL database on [Neon](https://neon.tech). Copy the connection string to `DATABASE_URL`.

---

## License

MIT
