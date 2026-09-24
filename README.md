# Jantrack

Webbapp för att spara olika typer av information och visualisera den.

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind) · Neon Postgres · Drizzle ORM · Vercel

## Kom igång lokalt

```bash
npm install
cp .env.example .env.local   # eller: vercel env pull .env.local
npm run db:push              # skapa tabeller i databasen
npm run dev
```

## Databas

- Schema: `src/db/schema.ts`
- `npm run db:generate` – skapa migrering från schemat
- `npm run db:migrate` – kör migreringar
- `npm run db:push` – synka schemat direkt (snabbt under utveckling)
- `npm run db:studio` – bläddra i datan

## Deploy

Pushar till `main` deployas automatiskt till Vercel. `DATABASE_URL` sätts av Neon-integrationen i Vercel.
