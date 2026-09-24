# Jantrack

Personlig återhämtningsdagbok: följ nykterhet, möten (AA, NA, CA …), träning, medicin, vikt,
mående och anteckningar – dag för dag – och se utvecklingen visualiserad.

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind v4) · Neon Postgres · Drizzle ORM ·
Better Auth (e-post + lösenord) · Vercel

## Struktur

```
src/
  app/
    (auth)/            logga-in, registrera – öppna sidor
    (app)/             inloggade sidor: översikt, incheckning, dagbok, nykterhet, medicin, ai
    (app)/actions.ts   alla server actions (sparar data, kontrollerar inloggning + validerar)
    api/auth/          Better Auths endpoints
  components/
    ui/                designsystemets byggstenar (Card, Badge, Button, TickProgress …)
    charts/            LineChart (hover-tooltip), MonthBars
    forms/             formulär för incheckning, möten, träning, medicin, nykterhet
    shell/             sidomeny, toppfält, användarmeny
  db/schema.ts         alla tabeller
  lib/                 auth, session, datumhjälp (svensk tid), datafrågor
  proxy.ts             skickar utloggade besökare till /logga-in
```

**Säkerhet:** varje fråga och action filtrerar på inloggad användares id – ingen kan läsa
eller ändra någon annans data. Inloggningen har rate limiting lagrad i databasen.

**Designsystem:** färger och radier är tokens i `src/app/globals.css` (ljust och mörkt läge).

## Kom igång lokalt

```bash
npm install
vercel env pull .env.local --environment=production   # hämtar DATABASE_URL
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run db:migrate
npm run dev
```

## Databas

- Ändra schemat i `src/db/schema.ts` → `npm run db:generate` → committa filen i `drizzle/` → pusha.
- Migreringarna körs automatiskt i varje bygge på Vercel (`scripts/migrate.mjs`).
- `npm run db:studio` – bläddra i datan.

## Deploy

Push till `main` deployas automatiskt till Vercel. Miljövariabler i Vercel:
`DATABASE_URL` (från Neon-integrationen) och `BETTER_AUTH_SECRET` (sätts manuellt).
