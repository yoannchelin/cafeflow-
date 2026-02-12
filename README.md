# CafeFlow ☕️ — Real-time ordering + Staff dashboard (MERN)

A production-style demo project designed to stand out in interviews:
- **Customer**: mobile ordering page (QR-style), live order status updates
- **Staff**: live kitchen/barista dashboard, status updates in real-time
- **Admin**: menu management (CRUD) with role-based access

**Tech**
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + MongoDB (Mongoose)
- Realtime: Socket.IO (separate namespaces for staff + customers)
- Auth: JWT access token + refresh token (httpOnly cookie)
- Quality: basic tests + GitHub Actions CI

---

## Quick demo flow
1. Open Customer page → add items → place order
2. Open Staff dashboard → see order appear instantly → change status
3. Customer page updates live (NEW → IN_PROGRESS → READY → COMPLETED)

---

## Repo structure
- `server/` Express API + Socket.IO
- `web/` React app (Customer + Staff + Admin)

---

## Run locally (recommended)
### 1) Start MongoDB
```bash
docker compose up -d
```

### 2) Backend
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 3) Frontend
```bash
cd ../web
cp .env.example .env
npm install
npm run dev
```

Open: http://localhost:5173

**Staff login (seeded)**
- admin: `admin@cafeflow.dev` / `Admin123!`
- staff: `staff@cafeflow.dev` / `Staff123!`

---

## Deploy (mobile-friendly)
You can deploy without coding, just by uploading this repo and clicking deploy.

### Backend (Render / Fly / Railway)
Set env vars:
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (your frontend URL)
- `NODE_ENV=production`

Start command:
```bash
npm start
```

### Frontend (Vercel / Netlify)
Set env var:
- `VITE_API_URL` = your backend URL (e.g. https://cafeflow-api.onrender.com)

Build:
```bash
npm run build
```
Output: `dist/`

---

## Notes for recruiters
This project focuses on:
- realtime event-driven UX (Socket.IO)
- API design + validation
- auth + roles
- clean repo hygiene (README, env examples, tests, CI)

