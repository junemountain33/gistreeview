Railway deployment for GISTREEVIEW

Overview

This guide shows how to deploy the backend and frontend of GISTREEVIEW to Railway and connect the backend to a Supabase Postgres database.

Assumptions

- You have a Railway account and are logged in.
- You have a Supabase project (gistreeview) and can access the Postgres connection string.
- Your repository is pushed to GitHub and connected to Railway.

Environment variables (backend)

- DATABASE_URL: postgres://<user>:<password>@<host>:5432/<db>
- UPLOAD_DIR: /tmp/uploads (or configure object storage)
- CORS_ORIGIN: https://<frontend-railway-url> (or * for testing)

Environment variables (frontend)

- VITE_API_BASE_URL: https://<backend-railway-url>
- SUPABASE_URL: (only if frontend uses Supabase client directly)
- SUPABASE_ANON_KEY: (only if frontend uses Supabase client directly)

Backend setup (Railway)

1. In Railway, create a new project and select "Deploy from GitHub". Choose the repository root or the `backend` subfolder as the service path.
2. Set the Environment Variables in Railway Settings (Service) → "Environment". Add `DATABASE_URL`, `UPLOAD_DIR`, and `CORS_ORIGIN`.
3. Set the Build & Start commands in Railway if required:
   - Build command: `npm install`
   - Start command: `npm start` (this runs `npx prisma migrate deploy && node src/index.js`)
4. Deploy. Railway will run `npm start` which triggers Prisma migrations.
5. Check logs. If migrations fail, open Railway Shell and run manually:

```
npx prisma migrate deploy
node prisma/seed-dummy.js
```

Frontend setup (Railway or static hosting)

1. Create a new static site service in Railway (or use another static host) and connect to the `frontend` folder as the service path.
2. Set `VITE_API_BASE_URL` to `https://<backend-railway-url>`.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Deploy and test.

Notes

- If you use Supabase Storage for uploads, set `UPLOAD_DIR` to the configured mount or change backend upload logic to use Supabase SDK.
- If you posted DB credentials in public channels, rotate the password immediately and update `DATABASE_URL` in Railway.

Troubleshooting

- EADDRINUSE on startup: change the port in Railway service settings or ensure Railway assigns the PORT environment variable.
- Prisma errors: ensure `DATABASE_URL` is valid and database is reachable from Railway.

If you want, I can:
- Help encode your password into the connection string safely and verify format.
- Generate the exact `DATABASE_URL` string from your DB details (you must paste the host/user/db name; avoid pasting the password if you want to keep it secret).

Railway CLI (optional)

You can use the Railway CLI to link and deploy services from your machine. I included a small Windows helper script `railway-deploy.bat` that runs `railway init` and `railway up` for the `backend` and `frontend` folders.

Prereqs:
- Install Railway CLI: https://railway.app/docs/cli
- Login: `railway login`

Usage (from repo root, Windows cmd.exe):

```
railway-deploy.bat backend
railway-deploy.bat frontend
railway-deploy.bat all
```

Notes:
- `railway init` will prompt you to create or link to an existing Railway project/service. During init, choose the correct service path (`backend` or `frontend`).
- After linking, `railway up` deploys the service and shows logs. Set environment variables in the Railway web dashboard (recommended) or via `railway variables set`.
