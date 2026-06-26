/**
 * ============================================================
 * FLORIFY – Supabase klient (prohlížeč / client-side)
 * ============================================================
 *
 * Tento soubor vytváří připojení k Supabase z React komponent.
 * Klíče se načítají z proměnných prostředí (.env.local).
 *
 * KAM VLOŽIT KLÍČE:
 * 1. Otevřete soubor .env.local v kořeni projektu (vedle package.json)
 * 2. Najděte řádky NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. Vložte tam hodnoty ze Supabase Dashboard → Project Settings → API
 *
 * NEXT_PUBLIC_SUPABASE_URL     → pole "Project URL"
 * NEXT_PUBLIC_SUPABASE_ANON_KEY → pole "anon public" (veřejný klíč)
 *
 * ⚠️ Nikdy sem nevkládejte "service_role" klíč – ten patří jen na server!
 * ============================================================
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[Florify] Chybí Supabase klíče! Doplňte NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY do .env.local"
    );
  }

  return createBrowserClient(
    supabaseUrl ?? "https://placeholder.supabase.co",
    supabaseAnonKey ?? "placeholder-key"
  );
}
