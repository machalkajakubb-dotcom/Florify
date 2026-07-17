"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useLang } from "@/hooks/useLang";

type Category = "jars" | "liquid" | "stored" | "dried";

interface ProductEntry {
  id: string;
  category: Category;
  name: string;
  amount: number;
  unit: string;
  season: number;
  note: string;
  created_at: string;
}

const CATEGORIES: { id: Category; emoji: string; unit: string }[] = [
  { id: "jars",   emoji: "🥫", unit: "ks" },
  { id: "liquid", emoji: "🍾", unit: "l" },
  { id: "stored", emoji: "🍎", unit: "ks" },
  { id: "dried",  emoji: "🌿", unit: "kg" },
];

const T = {
  en: {
    title: "My Products", addBtn: "Add Product", season: "Season", total: "Total",
    catLabel: "Category", nameLabel: "Name (e.g. Strawberry jam)", amount: "Amount", unit_of: "unit",
    note: "Note (optional)", save: "Save", cancel: "Cancel",
    empty: "No products yet. Start tracking your preserves and stores!",
    confirmDeleteTitle: "Delete this entry?", confirmDeleteMessage: "This action cannot be undone.",
    confirmDeleteYes: "Delete", confirmDeleteNo: "Cancel", dateLabel: "Date",
    cats: { jars: "Jars & Jams", liquid: "Liquids", stored: "Stored", dried: "Dried" },
    catsDesc: {
      jars: "Preserves & jams (jars)",
      liquid: "Juices, syrups, wines, spirits",
      stored: "Crates of apples, sacks of potatoes",
      dried: "Herbs, dried fruit, mushrooms",
    },
    units: { ks: "pcs", l: "l", kg: "kg" },
  },
  cs: {
    title: "Moje Výrobky", addBtn: "Přidat výrobek", season: "Sezona", total: "Celkem",
    catLabel: "Kategorie", nameLabel: "Název (např. Jahodový džem)", amount: "Množství", unit_of: "jednotka",
    note: "Poznámka (volitelně)", save: "Uložit", cancel: "Zrušit",
    empty: "Zatím žádné výrobky. Začni sledovat své zavařeniny a zásoby!",
    confirmDeleteTitle: "Opravdu smazat záznam?", confirmDeleteMessage: "Tuto akci nelze vzít zpět.",
    confirmDeleteYes: "Smazat", confirmDeleteNo: "Zrušit", dateLabel: "Datum",
    cats: { jars: "Zavařeniny & Džemy", liquid: "Tekuté", stored: "Skladované", dried: "Sušené" },
    catsDesc: {
      jars: "Zavařeniny a džemy (sklenice)",
      liquid: "Mošty, sirupy, vína, pálenky",
      stored: "Bedny jablek, pytle brambor",
      dried: "Bylinky, křížaly, houby",
    },
    units: { ks: "ks", l: "l", kg: "kg" },
  },
  de: {
    title: "Meine Produkte", addBtn: "Produkt hinzufügen", season: "Saison", total: "Gesamt",
    catLabel: "Kategorie", nameLabel: "Name (z.B. Erdbeermarmelade)", amount: "Menge", unit_of: "Einheit",
    note: "Notiz (optional)", save: "Speichern", cancel: "Abbrechen",
    empty: "Noch keine Produkte. Beginne, dein Eingemachtes und deine Vorräte zu verfolgen!",
    confirmDeleteTitle: "Eintrag wirklich löschen?", confirmDeleteMessage: "Diese Aktion kann nicht rückgängig gemacht werden.",
    confirmDeleteYes: "Löschen", confirmDeleteNo: "Abbrechen", dateLabel: "Datum",
    cats: { jars: "Eingemachtes & Marmeladen", liquid: "Flüssiges", stored: "Gelagert", dried: "Getrocknet" },
    catsDesc: {
      jars: "Eingemachtes & Marmeladen (Gläser)",
      liquid: "Säfte, Sirupe, Weine, Schnäpse",
      stored: "Kisten Äpfel, Säcke Kartoffeln",
      dried: "Kräuter, Dörrobst, Pilze",
    },
    units: { ks: "Stk", l: "l", kg: "kg" },
  },
  pl: {
    title: "Moje Wyroby", addBtn: "Dodaj wyrób", season: "Sezon", total: "Łącznie",
    catLabel: "Kategoria", nameLabel: "Nazwa (np. Dżem truskawkowy)", amount: "Ilość", unit_of: "jednostka",
    note: "Notatka (opcjonalnie)", save: "Zapisz", cancel: "Anuluj",
    empty: "Brak wyrobów. Zacznij śledzić swoje przetwory i zapasy!",
    confirmDeleteTitle: "Na pewno usunąć wpis?", confirmDeleteMessage: "Tej czynności nie można cofnąć.",
    confirmDeleteYes: "Usuń", confirmDeleteNo: "Anuluj", dateLabel: "Data",
    cats: { jars: "Przetwory i Dżemy", liquid: "Płyny", stored: "Przechowywane", dried: "Suszone" },
    catsDesc: {
      jars: "Przetwory i dżemy (słoiki)",
      liquid: "Soki, syropy, wina, nalewki",
      stored: "Skrzynki jabłek, worki ziemniaków",
      dried: "Zioła, suszone owoce, grzyby",
    },
    units: { ks: "szt", l: "l", kg: "kg" },
  },
};

export default function ProductsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T["en"];

  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState<Category>("jars");
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!formName.trim() || !formAmount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const cat = CATEGORIES.find(c => c.id === formCategory)!;
    const { data } = await supabase.from("products").insert({
      user_id: user.id,
      category: formCategory,
      name: formName.trim(),
      amount: parseFloat(formAmount),
      unit: cat.unit,
      season: new Date().getFullYear(),
      note: formNote,
    }).select().single();
    if (data) setEntries(prev => [data, ...prev]);
    setFormName(""); setFormAmount(""); setFormNote(""); setFormCategory("jars"); setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const formatDate = (iso: string) => {
    const localeMap: Record<string, string> = { cs: "cs-CZ", en: "en-GB", de: "de-DE", pl: "pl-PL" };
    return new Date(iso).toLocaleDateString(localeMap[lang] ?? "en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const unitLabel = (u: string) => t.units[u as keyof typeof t.units] ?? u;

  // Group by season, then by category within season
  const bySeason = entries.reduce((acc, e) => {
    if (!acc[e.season]) acc[e.season] = [];
    acc[e.season].push(e);
    return acc;
  }, {} as Record<number, ProductEntry[]>);
  const seasons = Object.keys(bySeason).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BackButton />
              <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">{t.title}</h1>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2">{t.addBtn}</button>
          </div>

          {loading ? <div className="flex justify-center py-12"><img src="/icons/loading-tomato.png" alt="" className="w-10 h-10 animate-pulse-soft" /></div>
          : seasons.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">🥫</div>
              <p className="text-stone-400 text-sm">{t.empty}</p>
            </div>
          ) : seasons.map(season => {
            const seasonEntries = bySeason[season];
            const byCategory = seasonEntries.reduce((acc, e) => {
              if (!acc[e.category]) acc[e.category] = [];
              acc[e.category].push(e);
              return acc;
            }, {} as Record<Category, ProductEntry[]>);

            return (
              <div key={season}>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{t.season} {season}</h2>
                  <span className="text-xs bg-forest-100 dark:bg-forest-900 text-forest-600 dark:text-forest-300 px-2 py-0.5 rounded-full">{seasonEntries.length}</span>
                </div>

                {CATEGORIES.filter(c => byCategory[c.id]?.length).map(cat => (
                  <div key={cat.id} className="mb-3">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <span>{cat.emoji}</span> {t.cats[cat.id]}
                    </p>
                    <div className="space-y-2">
                      {byCategory[cat.id].map(e => (
                        <div key={e.id} className="card flex items-center gap-3 py-3">
                          <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">{e.name}</p>
                            <p className="text-xs text-stone-400 dark:text-gray-500">
                              <span className="font-bold text-forest-600 dark:text-forest-400">{e.amount} {unitLabel(e.unit)}</span>
                              {e.note && <> · {e.note}</>}
                            </p>
                            <p className="text-[11px] text-stone-300 dark:text-gray-600 mt-0.5">{formatDate(e.created_at)}</p>
                          </div>
                          <button onClick={() => setPendingDelete(e.id)}
                            className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950 text-red-400 text-xs flex items-center justify-center flex-shrink-0">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      {/* Formulář */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4 space-y-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t.addBtn}</h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 text-xl">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 dark:text-gray-500 mb-1.5 ml-1">{t.catLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFormCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 text-sm transition-all ${
                      formCategory === cat.id
                        ? "border-forest-500 bg-forest-50 dark:bg-forest-950 text-forest-800 dark:text-forest-200 font-semibold"
                        : "border-stone-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-bark-700 dark:text-gray-300"
                    }`}>
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-left leading-tight">{t.cats[cat.id]}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 dark:text-gray-500 mt-1.5 ml-1">{t.catsDesc[formCategory]}</p>
            </div>

            <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
              placeholder={t.nameLabel} className="input-field" />

            <div className="flex gap-2 items-center">
              <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                placeholder={t.amount} className="input-field flex-1" min="0" step="0.1" />
              <span className="text-sm text-stone-400 dark:text-gray-500 px-1 flex-shrink-0">
                {unitLabel(CATEGORIES.find(c => c.id === formCategory)!.unit)}
              </span>
            </div>

            <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)}
              placeholder={t.note} className="input-field" />

            <div className="flex gap-2 pb-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">{t.cancel}</button>
              <button onClick={handleSave} disabled={!formName.trim() || !formAmount || saving}
                className="btn-primary flex-1 py-3 disabled:opacity-50">{t.save}</button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t.confirmDeleteTitle}
        message={t.confirmDeleteMessage}
        confirmLabel={t.confirmDeleteYes}
        cancelLabel={t.confirmDeleteNo}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); setPendingDelete(null); }}
      />
    </div>
  );
}
