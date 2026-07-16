# 🌱 Florimy – Chytrý zahradní asistent

Hyper-lokální, vícejazyčný AI asistent pro zahrádkáře. Postaveno na Next.js, Supabase a Google Gemini.

---

## 🚀 NÁVOD PRO ZAČÁTEČNÍKY – Spuštění krok za krokem

### KROK 1 – Stáhněte a nainstalujte Node.js
1. Jděte na **https://nodejs.org** a stáhněte verzi **LTS** (zelené tlačítko)
2. Nainstalujte jako normální program
3. Ověřte v terminálu: `node --version` → mělo by napsat `v20.x.x`

### KROK 2 – Naklonujte projekt
```bash
git clone https://github.com/VAS-USERNAME/florify.git
cd florify
npm install
```

---

## 🔑 KROK 3 – Získejte API klíče (NEJDŮLEŽITĚJŠÍ část)

### A) Supabase (databáze a přihlašování) – ZDARMA

1. Jděte na **https://supabase.com** a registrujte se (lze přes GitHub)
2. Klikněte na **"New Project"**
3. Zadejte název projektu (např. "florify") a heslo databáze
4. Počkejte ~2 minuty na vytvoření
5. V levém menu klikněte na **"Settings"** → **"API"**
6. Zkopírujte:
   - **Project URL** → vložte jako `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (pod "Project API keys") → vložte jako `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### B) Databázové tabulky v Supabase

1. V Supabase klikněte vlevo na **"SQL Editor"**
2. Klikněte **"New Query"**
3. Zkopírujte celý obsah souboru `supabase-schema.sql` z tohoto projektu
4. Klikněte **"Run"** (nebo Ctrl+Enter)
5. Měli byste vidět "Success. No rows returned."

### C) OpenWeatherMap (počasí) – ZDARMA

1. Jděte na **https://openweathermap.org/api**
2. Klikněte **"Sign Up"** a vytvořte účet
3. Po přihlášení jděte na **"My API Keys"** (nahoře vpravo pod vaším jménem)
4. Zkopírujte **výchozí API klíč** (nebo vytvořte nový)
5. ⚠️ Klíč začne fungovat až za **~10 minut** po registraci
6. Vložte jako `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### D) Google Gemini API (AI botanička Flora) – ZDARMA (v rámci limitů)

1. Jděte na **https://aistudio.google.com/apikey**
2. Přihlaste se Google účtem a klikněte **"Create API key"**
3. Zkopírujte klíč (začíná `AIzaSy...`)
4. Vložte jako `GEMINI_API_KEY`

---

## 📄 KROK 4 – Vytvořte soubor .env.local

1. V hlavní složce projektu vytvořte soubor s názvem **`.env.local`** (s tečkou na začátku!)
2. Vložte do něj toto a doplňte své klíče:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
NEXT_PUBLIC_OPENWEATHER_API_KEY=abc123def456...
GEMINI_API_KEY=AIzaSy...
```

⚠️ **POZOR:** Soubor `.env.local` **NIKDY** nenahrávejte na GitHub! Je v `.gitignore`, takže by se tam nahrát neměl.

---

## ▶️ KROK 5 – Spusťte aplikaci

```bash
npm run dev
```

Otevřete prohlížeč na adrese **http://localhost:3000**

---

## 🚀 KROK 6 – Nasazení na internet (Vercel) – ZDARMA

1. Jděte na **https://vercel.com** a registrujte se přes GitHub
2. Klikněte **"New Project"** a vyberte váš GitHub repozitář
3. Před nasazením klikněte na **"Environment Variables"** a přidejte všechny čtyři klíče ze souboru `.env.local`
4. Klikněte **"Deploy"**
5. Za ~2 minuty máte aplikaci na internetu! 🎉

---

## 📱 PWA Ikona (rajče na ploše mobilu)

Aplikace je připravena jako PWA. Pro ikonu rajčete:
1. Připravte obrázky rajčete v těchto velikostech: 72, 96, 128, 144, 152, 192, 384, 512 px
2. Uložte je do složky `/public/icons/` s názvy `icon-192x192.png` atd.
3. Doporučený nástroj pro generování všech velikostí: **https://realfavicongenerator.net**

---

## 📁 Struktura projektu

```
florify/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Hlavní layout + PWA meta
│   │   ├── page.tsx            ← Dashboard (domovská stránka)
│   │   ├── login/page.tsx      ← Přihlášení / registrace
│   │   ├── garden/page.tsx     ← Správa rostlin
│   │   ├── calendar/page.tsx   ← Zahradní kalendář
│   │   ├── chat/page.tsx       ← Chat s Florou (AI)
│   │   └── api/chat/route.ts   ← Backend API pro AI chat
│   ├── components/
│   │   ├── Navigation.tsx      ← Fixní spodní lišta
│   │   ├── WeatherWidget.tsx   ← Widget počasí
│   │   ├── PlantGrid.tsx       ← Mřížka rostlin + modal
│   │   └── Calendar.tsx        ← Zahradní kalendář
│   ├── hooks/
│   │   └── useLang.tsx         ← Vícejazyčnost
│   ├── locales/
│   │   ├── cs.json             ← Čeština
│   │   ├── en.json             ← Angličtina
│   │   ├── de.json             ← Němčina
│   │   └── pl.json             ← Polština
│   └── utils/
│       ├── supabaseClient.ts   ← Připojení k databázi
│       └── plantCatalog.ts     ← Katalog 15 rostlin
├── public/
│   ├── manifest.json           ← PWA manifest
│   └── icons/                  ← Sem nahrajte ikony rajčete
├── supabase-schema.sql         ← SQL pro vytvoření tabulek
└── .env.example                ← Šablona pro .env.local
```

---

## ❓ Časté problémy

**Aplikace jde na login stránku ale přihlášení nefunguje:**
→ Zkontrolujte `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY` v `.env.local`

**Počasí se nezobrazuje:**
→ OpenWeather klíč funguje až 10 minut po registraci. Zatím se zobrazí mockovaná data.

**Flora AI neodpovídá správně:**
→ Zkontrolujte `GEMINI_API_KEY`. Bez klíče funguje v demo režimu.

**Na mobilu aplikace nevypadá jako mobilní appka:**
→ V Chrome klikněte na "Přidat na plochu" (tři tečky → Přidat na plochu). Pak se spustí v standalone módu bez adresního řádku.
