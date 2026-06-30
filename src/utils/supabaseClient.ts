import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Chybí proměnné prostředí Supabase. Zkontrolujte soubor .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
