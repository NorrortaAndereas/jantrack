# Jantrack

Webbapp för att spara olika typer av information och visualisera den.

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind) · Neon Postgres · Drizzle ORM · Vercel

## Kom igång lokalt

```bash
npm install
vercel env pull .env.local --environment=production   # hämtar DATABASE_URL
npm run db:migrate           # skapa tabeller i databasen
npm run dev
```

## Databas

- Schema: `src/db/schema.ts`
- `npm run db:generate` – skapa migrering från schemat
- `npm run db:migrate` – kör migreringar
- `npm run db:push` – synka schemat direkt (snabbt under utveckling)
- `npm run db:studio` – bläddra i datan

## Deploy

Pushar till `main` deployas automatiskt till Vercel. `DATABASE_URL` sätts av Neon-integrationen, och migreringarna i `drizzle/` körs automatiskt i varje bygge (`scripts/migrate.mjs`).

Ändra schemat så här: redigera `src/db/schema.ts` → `npm run db:generate` → committa den nya filen i `drizzle/` → pusha.
