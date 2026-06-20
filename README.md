# TraceLess Access

Zero-trust secure document sharing: upload files with view limits and expiry, share OTP-protected links, and audit every access attempt.

**Stack:** React + Vite (frontend) · Vercel Serverless (API) · Supabase (database + file storage) · Resend (optional OTP email)

---

## 1. Supabase setup (free tier)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Go to **Storage → New bucket**:
   - Name: `traceless-files`
   - Public: **OFF** (private bucket)
4. Copy from **Project Settings → API**:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret, server-only)

---

## 2. Local development

```bash
npm install
cp .env.example .env.local
# Fill in Supabase credentials in .env.local
```

Run the full app (frontend + API):

```bash
npx vercel dev
```

Or run frontend only (API calls need `vercel dev` on port 3000):

```bash
npm run dev:frontend
```

---

## 3. Deploy to Vercel (free tier)

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add these **Environment Variables** in Vercel project settings:

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (never expose to client) |
| `ADMIN_PASSCODE` | Yes | Admin login passcode for dashboard API |
| `VITE_ADMIN_PASSCODE` | Yes | Same value as `ADMIN_PASSCODE` |
| `RESEND_API_KEY` | No | Enables real OTP emails |
| `RESEND_FROM_EMAIL` | No | Verified sender in Resend (default: `onboarding@resend.dev`) |

4. Deploy. Vercel automatically builds the Vite app and deploys `/api/*` serverless functions.

---

## 4. Using the app

| Role | Default passcode | Pages |
|------|------------------|-------|
| Admin | `admin123` (change in env) | Dashboard, Upload, Vendor Access, Audit |
| Recipient | — | Secure Viewer (OTP or share link) |

**Share link format:** `https://your-app.vercel.app/?page=viewer&docId=doc-xxxxxxx`

**Upload flow:** Upload a file → copy the 6-digit OTP → send link + OTP to recipient.

**Email OTP (optional):** Enable "Highly Confidential Mode" on upload. Recipient enters their email, receives OTP via Resend (or sees it in a toast if Resend is not configured).

---

## API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/upload` | Public | Upload file + create document |
| `GET /api/document?docId=` | Public | Fetch document metadata |
| `POST /api/lookup-otp` | Public | Find document by 6-digit OTP |
| `POST /api/request-otp` | Public | Send OTP email |
| `POST /api/verify-otp` | Public | Verify OTP and download content |
| `GET /api/dashboard-data` | Admin header | List documents + audit logs |
| `POST /api/burn` | Admin header | Revoke or burn a document |
| `POST /api/clear-logs` | Admin header | Purge audit trail |

Admin requests must include header: `X-Admin-Token: <your ADMIN_PASSCODE>`.

---

## Resend (optional, free tier)

1. Sign up at [resend.com](https://resend.com).
2. Create an API key → `RESEND_API_KEY`.
3. For production, verify your own domain and set `RESEND_FROM_EMAIL`.
4. Without Resend, OTP codes appear in the UI toast after requesting verification.

---

## Scripts

```bash
npm run dev          # Full stack via Vercel dev server
npm run dev:frontend # Vite only
npm run build        # Production build
npm run preview      # Preview production build
```
