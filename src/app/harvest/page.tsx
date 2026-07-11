"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Navigation } from "@/components/Navigation";
import { useLang } from "@/hooks/useLang";
import { PLANT_CATALOG } from "@/utils/plantCatalog";

interface HarvestEntry {
  id: string;
  plant_id: string;
  plant_name: string;
  plant_emoji: string;
  amount: number;
  unit: "kg" | "ks";
  season: number;
  note: string;
  harvested_at: string;
}

const T = {
  en: { title:"Harvest Log", addBtn:"Log Harvest", season:"Season", total:"Total", unit_kg:"kg", unit_ks:"pcs",
        selectPlant:"Select plant", amount:"Amount", note:"Note (optional)", save:"Save", cancel:"Cancel",
        empty:"No harvest entries yet. Start tracking your yield!", noPlants:"Add plants to your garden first." },
  cs: { title:"Sklizeň", addBtn:"Zaznamenat sklizeň", season:"Sezona", total:"Celkem", unit_kg:"kg", unit_ks:"ks",
        selectPlant:"Vyber rostlinu", amount:"Množství", note:"Poznámka (volitelně)", save:"Uložit", cancel:"Zrušit",
        empty:"Zatím žádné záznamy. Začni sledovat svou úrodu!", noPlants:"Nejdřív přidej rostliny do zahrady." },
  de: { title:"Ernte-Log", addBtn:"Ernte eintragen", season:"Saison", total:"Gesamt", unit_kg:"kg", unit_ks:"Stk",
        selectPlant:"Pflanze wählen", amount:"Menge", note:"Notiz (optional)", save:"Speichern", cancel:"Abbrechen",
        empty:"Noch keine Einträge. Beginne deine Ernte zu verfolgen!", noPlants:"Füge zuerst Pflanzen hinzu." },
  pl: { title:"Dziennik Zbiorów", addBtn:"Zapisz zbiory", season:"Sezon", total:"Łącznie", unit_kg:"kg", unit_ks:"szt",
        selectPlant:"Wybierz roślinę", amount:"Ilość", note:"Notatka (opcjonalnie)", save:"Zapisz", cancel:"Anuluj",
        empty:"Brak wpisów. Zacznij śledzić swoje zbiory!", noPlants:"Najpierw dodaj rośliny do ogrodu." },
};

export default function HarvestPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T["en"];
  const [entries, setEntries] = useState<HarvestEntry[]>([]);
  const [userPlantIds, setUserPlantIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formPlant, setFormPlant] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formUnit, setFormUnit] = useState<"kg"|"ks">("kg");
  const [formNote, setFormNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const [{ data: harvestData }, { data: plantData }] = await Promise.all([
      supabase.from("harvests").select("*").eq("user_id", user.id).order("harvested_at", { ascending: false }),
      supabase.from("plants").select("plant_id").eq("user_id", user.id),
    ]);
    setEntries(harvestData ?? []);
    setUserPlantIds((plantData ?? []).map((p: { plant_id: string }) => p.plant_id));
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!formPlant || !formAmount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const plant = PLANT_CATALOG.find(p => p.id === formPlant);
    const { data } = await supabase.from("harvests").insert({
      user_id: user.id,
      plant_id: formPlant,
      plant_name: plant?.names[lang] ?? plant?.names["en"] ?? formPlant,
      plant_emoji: plant?.emoji ?? "🌱",
      amount: parseFloat(formAmount),
      unit: formUnit,
      season: new Date().getFullYear(),
      note: formNote,
    }).select().single();
    if (data) setEntries(prev => [data, ...prev]);
    setFormPlant(""); setFormAmount(""); setFormNote(""); setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("harvests").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Group by season
  const bySeason = entries.reduce((acc, e) => {
    if (!acc[e.season]) acc[e.season] = [];
    acc[e.season].push(e);
    return acc;
  }, {} as Record<number, HarvestEntry[]>);
  const seasons = Object.keys(bySeason).map(Number).sort((a, b) => b - a);

  const availablePlants = PLANT_CATALOG.filter(p => userPlantIds.includes(p.id));

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 overflow-y-auto"
        style={{ paddingTop:"calc(env(safe-area-inset-top) + 20px)", paddingBottom:"calc(env(safe-area-inset-bottom) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">{t.title}</h1>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2">{t.addBtn}</button>
          </div>

          {loading ? <div className="text-center py-12 text-4xl animate-pulse-soft">🧺</div>
          : seasons.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">🌱</div>
              <p className="text-stone-400 text-sm">{availablePlants.length === 0 ? t.noPlants : t.empty}</p>
            </div>
          ) : seasons.map(season => {
            const seasonEntries = bySeason[season];
            const byPlant = seasonEntries.reduce((acc, e) => {
              if (!acc[e.plant_id]) acc[e.plant_id] = { emoji: e.plant_emoji, name: e.plant_name, kg: 0, ks: 0 };
              if (e.unit === "kg") acc[e.plant_id].kg += e.amount;
              else acc[e.plant_id].ks += e.amount;
              return acc;
            }, {} as Record<string, { emoji:string; name:string; kg:number; ks:number }>);

            return (
              <div key={season}>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{t.season} {season}</h2>
                  <span className="text-xs bg-forest-100 dark:bg-forest-900 text-forest-600 dark:text-forest-300 px-2 py-0.5 rounded-full">{seasonEntries.length}</span>
                </div>
                {/* Souhrn sezóny */}
                <div className="card mb-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">{t.total}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(byPlant).map(([pid, v]) => (
                      <div key={pid} className="flex items-center gap-1.5 bg-forest-50 dark:bg-forest-950 border border-forest-100 dark:border-forest-900 px-2.5 py-1.5 rounded-full text-sm">
                        <span>{v.emoji}</span>
                        <span className="font-medium text-forest-700 dark:text-forest-300">{v.name}</span>
                        <span className="text-forest-500 dark:text-forest-400">
                          {v.kg > 0 && `${v.kg.toFixed(1)} ${t.unit_kg}`}
                          {v.kg > 0 && v.ks > 0 && " · "}
                          {v.ks > 0 && `${v.ks} ${t.unit_ks}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Jednotlivé záznamy */}
                <div className="space-y-2">
                  {seasonEntries.map(e => (
                    <div key={e.id} className="card flex items-center gap-3 py-3 group">
                      <span className="text-2xl flex-shrink-0">{e.plant_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">{e.plant_name}</p>
                        <p className="text-xs text-stone-400 dark:text-gray-500">
                          <span className="font-bold text-forest-600 dark:text-forest-400">{e.amount} {e.unit === "kg" ? t.unit_kg : t.unit_ks}</span>
                          {e.note && <> · {e.note}</>}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(e.id)}
                        className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Formulář */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4 space-y-3"
            style={{ paddingBottom:"calc(env(safe-area-inset-bottom) + 16px)" }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t.addBtn}</h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 text-xl">✕</button>
            </div>
            <select value={formPlant} onChange={e => setFormPlant(e.target.value)} className="input-field">
              <option value="">{t.selectPlant}</option>
              {availablePlants.map(p => (
                <option key={p.id} value={p.id}>{p.emoji} {p.names[lang] ?? p.names["en"]}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                placeholder={t.amount} className="input-field flex-1" min="0" step="0.1" />
              <div className="flex bg-stone-100 dark:bg-gray-800 rounded-2xl p-1">
                {(["kg","ks"] as const).map(u => (
                  <button key={u} onClick={() => setFormUnit(u)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      formUnit === u ? "bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-300 shadow-sm" : "text-stone-500"
                    }`}>{u === "kg" ? t.unit_kg : t.unit_ks}</button>
                ))}
              </div>
            </div>
            <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)}
              placeholder={t.note} className="input-field" />
            <div className="flex gap-2 pb-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">{t.cancel}</button>
              <button onClick={handleSave} disabled={!formPlant || !formAmount || saving}
                className="btn-primary flex-1 py-3 disabled:opacity-50">{t.save}</button>
            </div>
          </div>
        </div>
      )}
      <Navigation />
    </div>
  );
}
