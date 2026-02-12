# Deploy CafeFlow from your phone (no coding)

You can publish this project with just **GitHub + Vercel + Render**.

## 0) Create accounts
- GitHub
- Vercel
- Render
- MongoDB Atlas (free tier)

---

## 1) Upload the repo (GitHub mobile)
1. Create a new GitHub repository: `cafeflow`
2. Upload the project:
   - On iPhone: easiest is **GitHub website (Safari)** → "Add file" → "Upload files"
   - Upload **all files** from this folder (or upload the ZIP then extract on a computer if needed)

---

## 2) MongoDB Atlas
1. Create a free cluster
2. Create a database user + password
3. Get connection string (MongoDB URI), example:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/cafeflow?retryWrites=true&w=majority`

---

## 3) Deploy the backend (Render)
1. New → **Web Service**
2. Connect your GitHub repo
3. Root directory: `server`
4. Build command: `npm ci`
5. Start command: `npm start`
6. Add env vars:
   - `MONGODB_URI` = (Atlas URI)
   - `JWT_ACCESS_SECRET` = random string
   - `JWT_REFRESH_SECRET` = random string
   - `CORS_ORIGIN` = (your Vercel frontend URL once created)
   - `NODE_ENV` = `production`
   - `COOKIE_SECURE` = `true` (because HTTPS on Render/Vercel)

7. Deploy
8. After deploy, open your API URL:
   - `https://<your-service>.onrender.com/api/health`

---

## 4) Deploy the frontend (Vercel)
1. New Project → Import your GitHub repo
2. Root directory: `web`
3. Env var:
   - `VITE_API_URL` = your Render backend URL (e.g. https://<service>.onrender.com)
4. Deploy

---

## 5) Final step: fix CORS
Go back to Render env vars:
- Set `CORS_ORIGIN` to your Vercel URL (e.g. https://cafeflow.vercel.app)
Redeploy.

---

## 6) Seed data (optional but recommended)
In Render → Shell (or use local):
- Run: `npm run seed`

Seeded staff accounts:
- admin@cafeflow.dev / Admin123!
- staff@cafeflow.dev / Staff123!

---

## Demo URLs
- Customer ordering: `/order`
- Staff dashboard: `/staff`
- Admin menu: `/admin/menu`
