"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PlantGrid } from "@/components/PlantGrid";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import type { Plant, UserProfile, Language, GardenBed } from "@/utils/supabaseClient";

function parseCells(raw: unknown) {
  if (!raw) return [];
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  if (Array.isArray(raw)) return raw;
  return [];
}

// ── Onboarding ─────────────────────────────────────────────────────────────────
function Onboarding({ onDone }: { onDone: (city: string, lang: Language) => void }) {
  const { t, setLang } = useLang();
  const [city, setCity] = useState("");
  const [selectedLang, setSelectedLang] = useState<Language>("cs");

  const langs: { code: Language; label: string; flag: string }[] = [
    { code:"cs", label:"Čeština",  flag:"🇨🇿" },
    { code:"en", label:"English",  flag:"🇬🇧" },
    { code:"de", label:"Deutsch",  flag:"🇩🇪" },
    { code:"pl", label:"Polski",   flag:"🇵🇱" },
  ];

  const handleDone = () => {
    if (!city.trim()) return;
    setLang(selectedLang);
    onDone(city.trim(), selectedLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-6 py-12 safe-top">
      <div className="w-full max-w-sm space-y-6 animate-fade-slide-up">
        <div className="text-center">
          <div className="text-6xl mb-3">🌱</div>
          <h1 className="font-display text-3xl font-bold text-forest-800 dark:text-forest-300">{t("welcome_title")}</h1>
          <p className="text-forest-600 dark:text-forest-400 mt-1 text-sm">{t("welcome_subtitle")}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-2">{t("onboarding_lang")}</label>
          <div className="grid grid-cols-2 gap-2">
            {langs.map(l => (
              <button key={l.code} onClick={() => setSelectedLang(l.code)}
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-sm ${
                  selectedLang === l.code
                    ? "border-forest-500 bg-forest-50 dark:bg-forest-950 text-forest-800 dark:text-forest-200 font-semibold"
                    : "border-stone-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-bark-700 dark:text-gray-300"
                }`}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-2">{t("onboarding_city")}</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            placeholder={t("onboarding_city_placeholder")} className="input-field"
            onKeyDown={e => e.key === "Enter" && handleDone()} />
        </div>

        <button onClick={handleDone} disabled={!city.trim()} className="btn-primary w-full text-base disabled:opacity-50">
          {t("onboarding_save")}
        </button>
      </div>
    </div>
  );
}

// ── Mini náhled záhonu pro dashboard ─────────────────────────────────────────
function BedPreviewCard({ bed, lang }: { bed: GardenBed; lang: string }) {
  const router = useRouter();
  const previewCols = Math.min(bed.cols, 5);
  const previewRows = Math.min(bed.rows, 2);
  const plantedCells = bed.cells.filter(c => c.plant_id);
  const uniqueEmojis = [...new Map(bed.cells.filter(c => c.plant_emoji).map(c => [c.plant_emoji, c])).values()].slice(0, 5);
  const plantedLabel: Record<string, string> = { cs:"obsazeno", en:"planted", de:"bepfl.", pl:"zasad." };

  return (
    <button onClick={() => router.push("/beds")}
      className="card hover:border-forest-300 dark:hover:border-forest-700 transition-colors text-left w-full">
      {/* Mini mřížka */}
      <div className="mb-2">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}>
          {Array.from({ length: previewRows }, (_, r) =>
            Array.from({ length: previewCols }, (_, c) => {
              const cell = bed.cells.find(cl => cl.row === r && cl.col === c);
              return (
                <div key={`${r}-${c}`}
                  className={`w-6 h-6 rounded border flex items-center justify-center text-[10px]
                    ${cell?.plant_emoji
                      ? "border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950"
                      : "border-dashed border-stone-200 dark:border-gray-700 bg-stone-50 dark:bg-gray-800"
                    }`}>
                  {cell?.plant_emoji ?? ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info */}
      <p className="font-semibold text-sm text-bark-900 dark:text-gray-100 truncate">{bed.name}</p>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex gap-0.5">
          {uniqueEmojis.map((c, i) => <span key={i} className="text-sm">{c.plant_emoji}</span>)}
        </div>
        <span className="text-[10px] text-stone-400">{plantedCells.length} {plantedLabel[lang] ?? plantedLabel["cs"]}</span>
      </div>
    </button>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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
    if (!prof?.city) { setNeedsOnboarding(true); setLoading(false); return; }
    setProfile(prof);

    const [{ data: userPlants }, { data: bedData }] = await Promise.all([
      supabase.from("plants").select("*").eq("user_id", user.id).order("added_at", { ascending: false }),
      supabase.from("garden_beds").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    ]);

    setPlants(userPlants ?? []);
    setBeds((bedData ?? []).map((b: Record<string, unknown>) => ({ ...b, cells: parseCells(b.cells) })));
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOnboardingDone = async (city: string, language: Language) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, email: user.email, city, language });
    setProfile({ id: user.id, email: user.email ?? "", city, language, created_at: new Date().toISOString() });
    setNeedsOnboarding(false);
  };

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
      <div className="text-4xl animate-bounce">🌿</div>
    </div>
  );
  if (needsOnboarding) return <Onboarding onDone={handleOnboardingDone} />;

  const bedsLabel: Record<string, string> = { cs:"Moje záhony", en:"My Beds", de:"Meine Beete", pl:"Moje grządki" };
  const addBedLabel: Record<string, string> = { cs:"Zobrazit vše →", en:"View all →", de:"Alle anzeigen →", pl:"Pokaż wszystkie →" };
  const addFirstLabel: Record<string, string> = { cs:"Vytvořit záhon →", en:"Create bed →", de:"Beet erstellen →", pl:"Utwórz grządkę →" };

  // Plná jména rostlin dle aktuálního jazyka
  const plantsWithNames = plants.map(p => {
    const cat = PLANT_CATALOG.find(c => c.id === p.plant_id);
    return { ...p, name: cat ? (cat.names[lang] ?? cat.names["cs"]) : p.name };
  });

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable pb-28 safe-top">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

          {/* Pozdrav */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-forest-600 dark:text-forest-400 font-medium">{greeting()} 👋</p>
              <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">Florify 🌱</h1>
            </div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
              className="text-xs text-stone-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              {t("auth_sign_out")}
            </button>
          </div>

          {/* Počasí */}
          <WeatherWidget city={profile?.city ?? "Praha"} />

          {/* Moje zahrada */}
          <section className="card">
            <h2 className="font-display font-bold text-lg mb-3 dark:text-gray-100">{t("dashboard_my_garden")}</h2>
            <PlantGrid plants={plantsWithNames} onAdd={handleAddPlant} onRemove={handleRemovePlant} />
          </section>

          {/* Moje záhony – 3 náhledy */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-lg dark:text-gray-100">{bedsLabel[lang]}</h2>
              <a href="/beds" className="text-xs text-forest-600 dark:text-forest-400 hover:underline font-medium">
                {beds.length > 0 ? addBedLabel[lang] : addFirstLabel[lang]}
              </a>
            </div>

            {beds.length === 0 ? (
              <a href="/beds" className="card flex items-center gap-3 border-dashed border-stone-200 dark:border-gray-700 hover:border-forest-300 dark:hover:border-forest-700 transition-colors">
                <span className="text-3xl">🪴</span>
                <p className="text-sm text-stone-400 dark:text-gray-500">{addFirstLabel[lang]}</p>
              </a>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {beds.slice(0, 3).map(b => <BedPreviewCard key={b.id} bed={b} lang={lang} />)}
              </div>
            )}
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
