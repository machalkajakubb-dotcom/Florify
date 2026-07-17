"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PlantGrid } from "@/components/PlantGrid";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import type { Plant, UserProfile, GardenBed, BedCell } from "@/utils/supabaseClient";

export const dynamic = "force-dynamic";

function parseCells(raw: unknown): BedCell[] {
  if (!raw) return [];
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  if (Array.isArray(raw)) return raw as BedCell[];
  return [];
}

// ── Mini náhled záhonu – jen mřížka a název ───────────────────────────────────
function BedPreviewCard({ bed }: { bed: GardenBed }) {
  const router = useRouter();
  const COLS = Math.min(bed.cols, 5);
  const ROWS = Math.min(bed.rows, 3);

  return (
    <button
      onClick={() => router.push("/beds")}
      className="card flex flex-col items-center gap-1.5 p-2 hover:border-forest-300 dark:hover:border-forest-700 transition-colors w-full"
    >
      {/* Mřížka záhonu – zmenšená, celý záhon */}
      <div className="w-full overflow-hidden">
        <div
          className="grid gap-0.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const cell = bed.cells.find(cl => cl.row === r && cl.col === c);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square rounded border flex items-center justify-center text-[10px] ${
                    cell?.plant_emoji
                      ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950"
                      : "border-dashed border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800"
                  }`}
                >
                  {cell?.plant_emoji ?? ""}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Jen název – ořezaný pokud přesahuje */}
      <p className="text-[11px] font-semibold text-bark-900 dark:text-gray-100 truncate w-full text-center leading-tight">
        {bed.name}
      </p>
    </button>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [beds, setBeds] = useState<GardenBed[]>([]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard_greeting_morning");
    if (h < 18) return t("dashboard_greeting_day");
    return t("dashboard_greeting_evening");
  };

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(prof ?? { id: user.id, email: user.email ?? "", city: "Praha", language: "en", created_at: new Date().toISOString() });
    const [{ data: userPlants }, { data: bedData }] = await Promise.all([
      supabase.from("plants").select("*").eq("user_id", user.id).order("added_at", { ascending: false }),
      supabase.from("garden_beds").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    ]);
    setPlants(userPlants ?? []);
    setBeds((bedData ?? []).map(b => ({
      id: b.id as string,
      user_id: b.user_id as string,
      name: b.name as string,
      note: (b.note as string) ?? "",
      year: b.year as number,
      cols: b.cols as number,
      rows: b.rows as number,
      created_at: b.created_at as string,
      cells: parseCells(b.cells),
    })));
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddPlant = async (plantId: string, name: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("plants")
      .insert({ user_id: user.id, plant_id: plantId, name, emoji, added_at: new Date().toISOString() })
      .select().single();
    if (data) setPlants(prev => [data, ...prev]);
  };

  const handleRemovePlant = async (id: string) => {
    await supabase.from("plants").delete().eq("id", id);
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <img src="/icons/loading-tomato.png" alt="" className="w-12 h-12 animate-bounce" />
    </div>
  );

  const plantsWithNames = plants.map(p => {
    const cat = PLANT_CATALOG.find(c => c.id === p.plant_id);
    return { ...p, name: cat ? (cat.names[lang] ?? cat.names["cs"]) : p.name };
  });

  const bedsLabel:     Record<string, string> = { cs: "Moje záhony",     en: "My Beds",          de: "Meine Beete",        pl: "Moje grządki" };
  const addBedLabel:   Record<string, string> = { cs: "Zobrazit vše →",  en: "View all →",        de: "Alle anzeigen →",    pl: "Pokaż wszystkie →" };
  const addFirstLabel: Record<string, string> = { cs: "Přidat záhon →",  en: "Add bed →",         de: "Beet hinzufügen →",  pl: "Dodaj grządkę →" };
  const hintLabel:     Record<string, string> = {
    cs: "Tip: Nejdřív si přidejte rostliny v záložce Zahrada – pak je budete moci sázet do záhonů a sledovat v kalendáři.",
    en: "Tip: First add plants in the Garden tab – then you can plant them in beds and track them in the calendar.",
    de: "Tipp: Fügen Sie zuerst Pflanzen im Garten-Tab hinzu – dann können Sie sie in Beete pflanzen und im Kalender verfolgen.",
    pl: "Wskazówka: Najpierw dodaj rośliny w zakładce Ogród – potem będziesz mógł sadzić je w grządkach i śledzić w kalendarzu.",
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable safe-top" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

          {/* Pozdrav */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-forest-600 dark:text-forest-400 font-medium">{greeting()} 👋</p>
              <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">Florimy 🌱</h1>
            </div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
              className="text-xs text-stone-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              {t("auth_sign_out")}
            </button>
          </div>

          {/* Počasí */}
          <WeatherWidget city={profile?.city ?? "Praha"} />

          {/* Tip pro nové uživatele */}
          {plants.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-2xl px-3 py-2.5 flex gap-2 items-start">
              <span className="text-base flex-shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">{hintLabel[lang]}</p>
            </div>
          )}

          {/* Moje zahrada – max 6 + tlačítko zobrazit vše */}
          <section className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg dark:text-gray-100">{t("dashboard_my_garden")}</h2>
              {plants.length > 6 && (
                <a href="/garden" className="text-xs text-forest-600 dark:text-forest-400 hover:underline font-medium">
                  {lang === "cs" ? `Zobrazit vše (${plants.length})` : lang === "en" ? `View all (${plants.length})` : lang === "de" ? `Alle (${plants.length})` : `Pokaż (${plants.length})`}
                </a>
              )}
            </div>
            <PlantGrid
              plants={plantsWithNames}
              onAdd={handleAddPlant}
              onRemove={handleRemovePlant}
              maxVisible={6}
              showViewAll={plants.length > 6}
              onViewAll={() => router.push("/garden")}
            />
          </section>

          {/* Moje záhony – stejný styl jako Moje zahrada */}
          <section className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg dark:text-gray-100">{bedsLabel[lang]}</h2>
              <a href="/beds" className="text-xs text-forest-600 dark:text-forest-400 hover:underline font-medium">
                {beds.length > 0 ? addBedLabel[lang] : addFirstLabel[lang]}
              </a>
            </div>

            {beds.length === 0 ? (
              <div className="text-center py-6 text-stone-400">
                <div className="text-3xl mb-2">🪴</div>
                <p className="text-sm">{lang === "cs" ? "Zatím žádné záhony." : lang === "en" ? "No beds yet." : lang === "de" ? "Noch keine Beete." : "Brak grządek."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {beds.slice(0, 3).map(b => <BedPreviewCard key={b.id} bed={b} />)}
              </div>
            )}

            {/* Tlačítko přidat záhon */}
            <a href="/beds"
              className="mt-3 btn-primary w-full">
              <span className="text-lg">+</span>
              {lang === "cs" ? "Přidat záhon" : lang === "en" ? "Add bed" : lang === "de" ? "Beet hinzufügen" : "Dodaj grządkę"}
            </a>
          </section>

          {/* Rychlé zkratky */}
          <div className="grid grid-cols-2 gap-3">
            <a href="/calendar" className="card flex items-center gap-3 hover:border-forest-300 dark:hover:border-forest-700 transition-colors">
              <span className="text-2xl">📅</span>
              <span className="font-semibold text-sm text-bark-800 dark:text-gray-200">{t("nav_calendar")}</span>
            </a>
            <a href="/chat" className="card flex items-center gap-3 hover:border-forest-300 dark:hover:border-forest-700 transition-colors">
              <span className="text-2xl">🌿</span>
              <span className="font-semibold text-sm text-bark-800 dark:text-gray-200">{t("nav_chat")}</span>
            </a>
          </div>
        </div>
      </main>
      <Navigation />
    </div>
  );
}
