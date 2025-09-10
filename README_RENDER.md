Render + Supabase quick deploy steps (backend + frontend)

This guide covers deploying the existing repo to Render (free tier) for backend and frontend, and Supabase for Postgres.

1) Prepare repo
- Push repository to GitHub and note the repo URL (e.g. `https://github.com/yourname/gistreeview`).
- If monorepo, the backend is in `backend/` and frontend in `frontend/`.

2) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- After project is ready, go to Settings -> Database -> Connection string and copy the `DATABASE_URL` (postgres connection string).

3) Create services on Render
- Login to https://render.com and click "New" -> "Web Service".
- Connect your GitHub repo and select the `backend` folder as the root for this service.
- Use the following settings:
  - Environment: Node
  - Branch: main (or any branch you want to deploy)
  - Build command: `npm install --legacy-peer-deps`
  - Start command: `npm start`
- In Render dashboard, under Environment, add env vars:
  - `DATABASE_URL` = your Supabase connection string
  - `UPLOAD_DIR` = `/tmp/uploads` (or configure cloud storage later)
  - `CORS_ORIGIN` = your frontend URL (leave blank for now)
- Create the service and wait for successful deploy.

4) Run Prisma migrations on Render
- Use Render shell (Open Shell from the Render service) or add a one-off deploy hook to run migrations.
- Command to run:
  - `npx prisma migrate deploy`
- Ensure `DATABASE_URL` is set in environment.

5) Deploy frontend to Render static site
- On Render, click "New" -> "Static Site" (or create another Web Service of type static)
- Connect the same repo and set the following:
  - Root: `frontend`
  - Build command: `npm install --legacy-peer-deps && npm run build`
  - Publish directory: `dist`
- After deploy, set an environment variable for the static site if needed (not always required):
  - `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com` (set after backend URL is known)

6) Finalize
- Update backend `CORS_ORIGIN` env var to your frontend URL.
- Test:
  - Visit `https://<your-backend>.onrender.com/` → should return JSON message.
  - Visit frontend URL and test login.

Notes & recommendations
- For production file uploads, use cloud object storage (S3, Backblaze, or Render's blob storage if available) and point `UPLOAD_DIR` accordingly.
- Keep secrets out of repository. Use Render's Dashboard to set env vars.
- If you want automatic prisma migrate on deploy, we can add a deploy step but be careful for production data.

If you want, I can now:
- Replace `repo` placeholders in `render.yaml` with your repo URL.
- Create a small script to run `prisma migrate deploy` automatically on render deploy.
- Add GitHub Actions to run tests or run migrations after deploy.

Which next step? (fill repo URL in render.yaml / add migration script / continue deploy steps)
