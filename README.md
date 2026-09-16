# ApniPharma Frontend

Next.js frontend for the ApniPharma Laravel application. It uses TypeScript,
the App Router, Tailwind CSS, and ESLint.

## Getting started

Copy the environment example and set the Laravel API URL if it differs from
the configured backend:

```powershell
Copy-Item .env.example .env.local
```

Install dependencies and run the development server:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Laravel API defaults to
`http://localhost:8000/api` during local development.

## Production deployment

The production frontend is configured for
[https://phamary-frontend.vercel.app](https://phamary-frontend.vercel.app), with
server-side API requests sent to `https://kirayacare.com/api`.

In Vercel, set these Production environment variables using
`.env.production.example` as the reference:

```text
BACKEND_API_URL=https://kirayacare.com/api
NEXT_PUBLIC_APP_URL=https://phamary-frontend.vercel.app
```

`BACKEND_API_URL` remains server-only. Browser requests use the same-origin
Next.js route handlers, which relay authenticated requests to Laravel.

## Commands

- `npm run dev` starts the development server.
- `npm run lint` checks the source with ESLint.
- `npm run build` creates a production build.
- `npm start` runs the production build.
