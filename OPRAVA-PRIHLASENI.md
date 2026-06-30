# 🚨 OPRAVA: Přihlášení nefunguje

## Problém č. 1 – Špatný Supabase klíč (HLAVNÍ PŘÍČINA)

Váš `.env.local` obsahuje tento klíč:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_coIffMAlx1gG9-...
```

**To je ŠPATNĚ!** Klíč začínající `sb_secret_` je interní Supabase klíč, ne ten správný.

### ✅ Správný postup – jak najít správný klíč:

1. Přihlaste se na **https://supabase.com**
2. Klikněte na váš projekt (npvypyzrcaxbyrpdfmqa)
3. V levém menu klikněte na **"Settings"** (ozubené kolečko dole)
4. Klikněte na **"API"**
5. Najděte sekci **"Project API keys"**
6. Zkopírujte klíč označený jako **"anon" / "public"**
   - Začíná takto: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Je to dlouhý JWT token (cca 200+ znaků)

### ✅ Správný .env.local soubor:

```
NEXT_PUBLIC_SUPABASE_URL=https://npvypyzrcaxbyrpdfmqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXX...
NEXT_PUBLIC_OPENWEATHER_API_KEY=YOUR_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Problém č. 2 – Supabase Email Confirmation

Supabase ve výchozím nastavení **vyžaduje potvrzení e-mailu** po registraci.
Pokud vám nepřichází e-mail, nebo chcete to vypnout pro testování:

1. V Supabase přejděte na **Authentication** → **Providers** → **Email**
2. Vypněte **"Confirm email"** přepínač
3. Uložte

Pak bude registrace okamžitá bez ověření e-mailem.

---

## Problém č. 3 – Restart serveru po změně .env.local

Po každé změně `.env.local` **MUSÍTE restartovat** vývojový server:
1. V terminálu zmáčkněte `Ctrl+C`
2. Znovu spusťte `npm run dev`
