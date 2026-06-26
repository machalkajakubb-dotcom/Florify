# Florify 🍅

Hyper-lokální vícejazyčný chytrý asistent pro zahrádkáře.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- OpenWeatherMap API
- Anthropic Claude API
- PWA (manifest.json)

## Rychlý start

```bash
npm install
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## Nastavení

1. Zkopírujte `.env.example` → `.env.local` a doplňte klíče
2. V Supabase spusťte SQL ze souboru `supabase/schema.sql`
3. Pro PWA ikony: otevřete `public/icons/tomato.svg` a exportujte jako PNG (192×192 a 512×512)

## Struktura

```
src/
  app/           # Stránky (dashboard, login, chat, …)
  components/    # UI komponenty
  context/       # Auth + lokalizace
  locales/       # Překlady (cs, en, de, pl)
  utils/         # Supabase klient, i18n, garden logika
public/
  manifest.json  # PWA konfigurace
  icons/         # Ikony aplikace
```

## Nasazení na Vercel

1. Pushněte repozitář na GitHub
2. Importujte projekt na [vercel.com](https://vercel.com)
3. V Settings → Environment Variables přidejte všechny proměnné z `.env.local`
4. Deploy
