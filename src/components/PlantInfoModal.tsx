"use client";

import { useEffect, useState } from "react";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import { useLang } from "@/hooks/useLang";

interface PlantInfoModalProps {
  plantId: string;
  onClose: () => void;
  onRemove?: () => void; // volitelné – zobrazí tlačítko smazat
}

const ROWS = [
  { key: "soilPrep",     icon: "🪱" },
  { key: "whenToPlant",  icon: "📅" },
  { key: "spray",        icon: "🧴" },
  { key: "fertilize",    icon: "🌿" },
  { key: "watering",     icon: "💧" },
  { key: "care",         icon: "✂️"  },
  { key: "harvest",      icon: "🧺" },
  { key: "afterHarvest", icon: "🍂" },
] as const;

const ROW_LABELS: Record<string, Record<string, string>> = {
  soilPrep:     { en: "Soil preparation",  cs: "Příprava záhonu",  de: "Bodenvorbereitung",   pl: "Przygotowanie gleby" },
  whenToPlant:  { en: "When to plant",     cs: "Kdy zasadit",      de: "Wann pflanzen",        pl: "Kiedy sadzić" },
  spray:        { en: "Spraying",          cs: "Postřik",          de: "Spritzen",             pl: "Opryskiwanie" },
  fertilize:    { en: "Fertilizing",       cs: "Hnojení",          de: "Düngung",              pl: "Nawożenie" },
  watering:     { en: "Watering",          cs: "Zálivka",          de: "Bewässerung",          pl: "Podlewanie" },
  care:         { en: "Plant care",        cs: "Péče o rostlinu",  de: "Pflanzenpflege",       pl: "Pielęgnacja" },
  harvest:      { en: "Harvest time",      cs: "Doba sklizně",     de: "Erntezeit",            pl: "Czas zbiorów" },
  afterHarvest: { en: "After harvest",     cs: "Po sklizni",       de: "Nach der Ernte",       pl: "Po zbiorach" },
};

const CARE_LABELS: Record<string, Record<string, string>> = {
  easy:   { en: "Easy",   cs: "Snadná péče", de: "Einfach",   pl: "Łatwa" },
  medium: { en: "Medium", cs: "Střední péče", de: "Mittel",    pl: "Średnia" },
  hard:   { en: "Hard",   cs: "Náročná péče", de: "Schwierig", pl: "Trudna" },
};
const CARE_COLORS = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  hard:   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function PlantInfoModal({ plantId, onClose, onRemove }: PlantInfoModalProps) {
  const { lang } = useLang();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const plant = PLANT_CATALOG.find(p => p.id === plantId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!plant) return null;

  const name = plant.names[lang] ?? plant.names["cs"];

  const removeLabel: Record<string, string> = { en: "Remove plant", cs: "Odebrat rostlinu", de: "Pflanze entfernen", pl: "Usuń roślinę" };
  const confirmLabel: Record<string, string> = { en: "Are you sure?", cs: "Opravdu odebrat?", de: "Wirklich entfernen?", pl: "Na pewno usunąć?" };
  const cancelLabel: Record<string, string> = { en: "Cancel", cs: "Zrušit", de: "Abbrechen", pl: "Anuluj" };
  const yesLabel: Record<string, string> = { en: "Remove", cs: "Odebrat", de: "Entfernen", pl: "Usuń" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl"
        style={{ maxHeight: "calc(100svh - 80px)" }}
      >
        {/* Hlavička – fixní */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-stone-100 dark:border-gray-800 flex-shrink-0">
          {/* Emoji v kruhu */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-950 dark:to-forest-900 border border-forest-200 dark:border-forest-800 flex items-center justify-center text-2xl flex-shrink-0">
            {plant.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100 truncate">{name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CARE_COLORS[plant.careLevel]}`}>
              {CARE_LABELS[plant.careLevel][lang] ?? CARE_LABELS[plant.careLevel]["en"]}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tlačítko smazat – jen pokud je předán handler */}
            {onRemove && !confirmRemove && (
              <button
                onClick={() => setConfirmRemove(true)}
                className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                title={removeLabel[lang] ?? removeLabel["en"]}
              >
                🗑
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-gray-800 flex items-center justify-center text-stone-500 hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors"
            >✕</button>
          </div>
        </div>

        {/* Potvrzení smazání – inline banner */}
        {confirmRemove && (
          <div className="mx-5 mt-3 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-2xl px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium flex-1">{confirmLabel[lang] ?? confirmLabel["en"]}</p>
            <button
              onClick={() => setConfirmRemove(false)}
              className="text-xs text-stone-500 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
            >{cancelLabel[lang] ?? cancelLabel["en"]}</button>
            <button
              onClick={() => { onRemove?.(); }}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors font-semibold"
            >{yesLabel[lang] ?? yesLabel["en"]}</button>
          </div>
        )}

        {/* Obsah – scrollovatelný */}
        <div
          className="overflow-y-auto flex-1 px-4 py-3 space-y-2"
          style={{
            WebkitOverflowScrolling: "touch",
            // Dostatečný padding dole – obsah nesmí zmizet pod navigací
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          }}
        >
          {ROWS.map(({ key, icon }) => {
            const detail = plant.details[key as keyof typeof plant.details];
            const text = (detail as unknown as Record<string, string>)[lang] ?? (detail as unknown as Record<string, string>)["cs"];
            const label = ROW_LABELS[key][lang] ?? ROW_LABELS[key]["en"];
            return (
              <div key={key} className="bg-stone-50 dark:bg-gray-800 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{icon}</span>
                  <p className="text-[11px] font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm text-bark-800 dark:text-gray-300 leading-relaxed">{text}</p>
              </div>
            );
          })}
          <div style={{ height: "8px" }} />
        </div>
      </div>
    </div>
  );
}
