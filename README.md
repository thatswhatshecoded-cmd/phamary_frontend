# ApniPharma Frontend

Next.js frontend for the ApniPharma Laravel application. It uses TypeScript,
the App Router, Tailwind CSS, and ESLint.

## Getting started

Copy the environment example and set the Laravel API URL if it differs from
the local default:

```powershell
Copy-Item .env.example .env.local
```

Install dependencies and run the development server:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Laravel API defaults to
`http://localhost:8000/api`.

## Commands

- `npm run dev` starts the development server.
- `npm run lint` checks the source with ESLint.
- `npm run build` creates a production build.
- `npm start` runs the production build.
