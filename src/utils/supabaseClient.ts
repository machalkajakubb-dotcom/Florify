import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Nehodíme chybu na úrovni modulu – to by spadlo i při statickém prerenderingu
// na Vercelu, kde NEXT_PUBLIC_* proměnné nemusí být v tomto kroku dostupné.
// Místo toho vytvoříme klienta s placeholder hodnotami; skutečná chyba se
// projeví až při reálném volání API za běhu v prohlížeči (kde už env je k dispozici).
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "Chybí proměnné prostředí Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Zkontrolujte .env.local nebo nastavení Environment Variables na Vercelu."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type Language = "cs" | "en" | "de" | "pl";

export interface UserProfile {
  id: string;
  email: string;
  city: string;
  language: Language;
  created_at: string;
}

export interface Plant {
  id: string;
  user_id: string;
  plant_id: string;
  name: string;
  emoji: string;
  added_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ── Záhony ───────────────────────────────────────────────────────────────────

export interface BedCell {
  row: number;
  col: number;
  plant_id: string | null;
  plant_name: string | null;
  plant_emoji: string | null;
}

export interface GardenBed {
  id: string;
  user_id: string;
  name: string;
  note: string;
  year: number;
  cols: number;
  rows: number;
  cells: BedCell[];
  created_at: string;
}
