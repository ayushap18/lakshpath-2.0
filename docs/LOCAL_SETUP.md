# 🧪 Local Setup Guide – LakshPath

This guide shows how to run the **backend**, **frontend**, and **Google OAuth** on your local machine.

> Folder root used below: `/Users/ayush18/Lakshpath`

---

## 1️⃣ Prerequisites

Install these once:

- **Node.js** ≥ 18
- **npm** (comes with Node)
- **PostgreSQL** (if using a Postgres `DATABASE_URL`) or SQLite (if using the default `file:./dev.db`)
- **Git**
- **Google account** (for OAuth)
- **Google Gemini API key** (optional but recommended)

---

## 2️⃣ Backend Environment (`backend/.env`)

Create a `.env` file in `backend/`:

```bash
cd /Users/ayush18/Lakshpath/backend

cat > .env << 'EOF'
NODE_ENV=development
PORT=5000

# 🔑 AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# 🔐 Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# 🗄️ Database
# For SQLite (default Prisma file DB)
DATABASE_URL=file:./dev.db

# For Postgres (if configured)
# DATABASE_URL=postgresql://user:password@localhost:5432/lakshpath

# 🌐 Frontend origin
CLIENT_ORIGIN=http://localhost:5173

# 🔑 JWT secret
JWT_SECRET=lakshpath-dev-secret

# 🎬 Demo mode
DEMO_MODE_ENABLED=true
EOF
```

### 2.1 Get Google Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **Create API key**
3. Copy it into `GEMINI_API_KEY` in `.env`

### 2.2 Get Google OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create **OAuth 2.0 Client ID** → type **Web application**
3. Set **Authorized JavaScript origins**:
   - `http://localhost:5173`
4. Set **Authorized redirect URIs**:
   - `http://localhost:5000/auth/google/callback` (or whatever your backend uses)
5. Copy the **Client ID** into `GOOGLE_CLIENT_ID` in `.env`

---

## 3️⃣ Install Dependencies

Run once per folder.

### Backend

```bash
cd /Users/ayush18/Lakshpath/backend
npm install
```

### Frontend

```bash
cd /Users/ayush18/Lakshpath/frontend
npm install
```

---

## 4️⃣ Database Setup (Backend)

If the project uses **Prisma** (it does in this repo):

```bash
cd /Users/ayush18/Lakshpath/backend

# Generate Prisma Client
npx prisma generate

# Apply migrations (creates DB if not present)
npx prisma migrate dev --name init
```

> If migrations already exist, Prisma will just apply them.

---

## 5️⃣ Start Backend (API + OAuth)

In **Terminal 1**:

```bash
cd /Users/ayush18/Lakshpath/backend
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Common health check URLs (depending on routes):
  - `http://localhost:5000/health`
  - `http://localhost:5000/api/health`

If you see an error about missing env vars, double‑check `backend/.env` against `backend/src/config/env.ts` / `dist/config/env.js`.

---

## 6️⃣ Start Frontend (React + Vite)

In **Terminal 2**:

```bash
cd /Users/ayush18/Lakshpath/frontend
npm run dev
```

- Frontend runs on: `http://localhost:5173`
- Open in browser: `http://localhost:5173`

The frontend will call the backend at `VITE_API_URL` (check `frontend/.env` or `src/services/api.ts`). If needed, create:

```bash
cd /Users/ayush18/Lakshpath/frontend

cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000
EOF
```

Restart `npm run dev` after changing `.env`.

---

## 7️⃣ Quick CORS / 403 Fix (for local demo)

If you see **HTTP ERROR 403 – Access to localhost was denied**, it’s usually CORS or auth.

### 7.1 Ensure `CLIENT_ORIGIN` matches frontend

`backend/.env`:

```env
CLIENT_ORIGIN=http://localhost:5173
```

Restart backend:

```bash
cd /Users/ayush18/Lakshpath/backend
npm run dev
```

### 7.2 (Optional) Relax CORS for local testing

In `backend/src/app.ts` (or wherever Express is configured), set:

```ts
import cors from 'cors';

app.use(
  cors({
    origin: '*', // ONLY for local dev / hackathon demo
  })
);
```

Restart backend after this change.

---

## 8️⃣ Typical Local Dev Flow

1. Start **backend**:
   ```bash
   cd /Users/ayush18/Lakshpath/backend
   npm run dev
   ```
2. Start **frontend**:
   ```bash
   cd /Users/ayush18/Lakshpath/frontend
   npm run dev
   ```
3. Open browser at:
   - `http://localhost:5173`
4. Use Google login (OAuth) from the UI.
5. Check backend logs in Terminal 1 if something fails.

---

## 9️⃣ Common Issues & Fixes

### ❌ `GEMINI_API_KEY is required`
- Make sure `GEMINI_API_KEY` is set in `backend/.env`.
- Restart backend after editing `.env`.

### ❌ `GOOGLE_CLIENT_ID is required`
- Ensure `GOOGLE_CLIENT_ID` is present in `backend/.env`.
- Confirm OAuth client is **Web application**.

### ❌ `HTTP ERROR 403` on `localhost`
- Verify you’re opening **frontend** at `http://localhost:5173`, not a protected backend route.
- Ensure `CLIENT_ORIGIN=http://localhost:5173` in `backend/.env`.
- Temporarily set CORS `origin: '*'` for local dev.

### ❌ `npm run dev` exits with code 130
- This usually means it was interrupted (Ctrl+C) or crashed.
- Re‑run and read the **first** error line in the terminal.
- If it’s unclear, copy the error and ask for help.

---

## 🔚 Summary – One‑Shot Commands

```bash
# Backend
cd /Users/ayush18/Lakshpath/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

```bash
# Frontend (new terminal)
cd /Users/ayush18/Lakshpath/frontend
npm install
npm run dev
```

Then visit: `http://localhost:5173` in your browser.
