Frontend (Vercel) + Backend (Render) + Database (Supabase) - Quick deploy guide

This guide shows a minimal path to get the project online using free/easy platforms:
- Frontend: Vercel (supports Vite)
- Backend: Render (Node web service)
- Database: Supabase (free Postgres)

1) Prepare repo
- Push your repository to GitHub (or Git provider supported by Vercel/Render).
- Frontend folder: `frontend`
- Backend folder: `backend`

2) Create database (Supabase)
- Go to https://app.supabase.com and create a new project.
- After project ready, go to Settings -> Database -> Connection string -> copy the `DATABASE_URL`.

3) Deploy backend to Render
- Sign in to https://render.com and create a new Web Service.
- Connect your GitHub repo and select the `backend` folder as the root (if monorepo, point to `backend`).
- Build/Start command: leave blank or use `npm install && npm run start` (Render will run `npm start` if present).
- Environment: add the following env vars in Render dashboard:
  - `DATABASE_URL` = (Supabase connection string)
  - `UPLOAD_DIR` = `/tmp/uploads` (or configure a cloud storage provider if you need persistence)
  - `CORS_ORIGIN` = your frontend URL (you can set later)
- After service is deployed, open the service URL -> `https://<your-backend>.onrender.com/` should return JSON `{ "message": "Backend API is running" }`.
- Run prisma migrations (in Render dashboard you can open a shell or use Deploy Hooks):
  - `npx prisma migrate deploy` (ensure `DATABASE_URL` is set in env)

4) Deploy frontend to Vercel
- Sign in to https://vercel.com and import the GitHub repo.
- When asked for root directory, set it to `frontend` (monorepo support).
- Build command: `npm run build`
- Output directory: `dist`
- Add Environment Variable in Vercel project settings:
  - `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com` (the backend URL)
- Deploy. After deployment, frontend should be available at `https://<your-frontend>.vercel.app`.

5) Verify
- Open frontend URL and try to login. Use browser DevTools Network tab to confirm POST goes to `https://<your-backend>/api/login` and returns 200.

Notes & next steps
- File uploads: by default backend serves uploads from `public/uploads`. For production use, configure cloud storage and update `UPLOAD_DIR`.
- If you prefer Fly.io for backend, I can add a `Dockerfile` + `fly.toml`.
- If you want automatic Prisma migrate on deploy, we can add a deploy script but be careful (use only for dev/staging).

If you want, I can now:
- Create `render.yaml` or `Dockerfile` + `fly.toml` for Fly deploy.
- Add a tiny CI step or GitHub Action to run migrations after deploy.

Which next step do you want? (create Flyfiles / add Render config / proceed to deploy guide for your account)
