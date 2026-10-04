# SDC Portal deployment

The application is split into two deployable projects:

| Component | Host | Project directory |
| --- | --- | --- |
| React/Vite admin frontend | Vercel | `frontend` |
| Express/MongoDB API | Render | `backend` |

## Before deploying

1. Push this repository to GitHub. Real `.env` files are ignored; never commit them.
2. Create a MongoDB Atlas database and allow the Render service to connect. Use a dedicated database user with a strong password, and URL-encode special characters in that password.
3. Verify the sender address in Resend before using it as `VERIFIED_FROM_EMAIL`.
4. Generate two different long random values for `JWT_SECRET` and `APP_ADMIN_JWT_SECRET`.

## Deploy the API to Render

The included [render.yaml](./render.yaml) creates the service with the correct `backend` root directory, `npm ci` build command, `npm start` command, and `/health` health check.

In Render, choose **New > Blueprint**, select this repository, and enter these secret environment variables when prompted:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret for admin login tokens |
| `APP_ADMIN_JWT_SECRET` | A different long random secret for app-admin tokens |
| `VERIFIED_FROM_EMAIL` | A Resend-verified sender email address |
| `RESEND_API_KEY` | Your Resend API key |
| `CORS_ORIGINS` | Exact frontend origin(s), comma-separated; for example `https://your-project.vercel.app` |

`NODE_ENV=production` is supplied by the Blueprint. Render supplies `PORT`; do not set it yourself. Once the deploy finishes, open `https://<your-render-service>.onrender.com/health`. It must return HTTP 200 with `"status":"ok"`.

If you add a custom Vercel domain later, append it to `CORS_ORIGINS` and redeploy the Render service. Origins must include `https://`, have no path, and be comma-separated.

## Deploy the frontend to Vercel

Create a Vercel project from the same repository and set **Root Directory** to `frontend`. Vercel will detect Vite; its build command is `npm run build` and its output directory is `dist`. The included [frontend/vercel.json](./frontend/vercel.json) keeps React Router routes working on a direct page refresh.

Add this Vercel environment variable for Production (and Preview only if you have also added that preview origin to `CORS_ORIGINS` on Render):

| Variable | Value |
| --- | --- |
| `VITE_BACKEND_URL` | `https://<your-render-service>.onrender.com/admin` |

The `/admin` suffix is required because the dashboard calls the admin API routes. Do not add a trailing slash. Redeploy Vercel after setting or changing this variable because Vite embeds `VITE_*` values at build time.

## Initial superadmin

There are no deployment credentials in source control. To create the first admin against the production database, set the three `SUPERADMIN_*` values from [backend/.env.example](./backend/.env.example) in a local `backend/.env`, then run:

```bash
cd backend
npm run seed:superadmin
```

The script is safe to rerun: it does not create a second admin with the same email and never prints the password.

## Release checklist

- `https://<render-service>.onrender.com/health` returns 200.
- Visiting the Vercel URL and refreshing `/login` or `/dashboard` still loads the frontend.
- An admin can sign in and load students without a browser CORS error.
- Upload a small `.xlsx` test file and send one test ticket to confirm MongoDB, temporary upload storage, and Resend are all configured correctly.
