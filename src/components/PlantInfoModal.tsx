"use client";

import { useEffect } from "react";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import { useLang } from "@/hooks/useLang";

interface PlantInfoModalProps {
  plantId: string;
  onClose: () => void;
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
  soilPrep:     { cs: "Příprava záhonu",  en: "Soil preparation", de: "Bodenvorbereitung",   pl: "Przygotowanie gleby" },
  whenToPlant:  { cs: "Kdy zasadit",      en: "When to plant",    de: "Wann pflanzen",        pl: "Kiedy sadzić" },
  spray:        { cs: "Postřik",          en: "Spraying",         de: "Spritzen",             pl: "Opryskiwanie" },
  fertilize:    { cs: "Hnojení",          en: "Fertilizing",      de: "Düngung",              pl: "Nawożenie" },
  watering:     { cs: "Zálivka",          en: "Watering",         de: "Bewässerung",          pl: "Podlewanie" },
  care:         { cs: "Péče o rostlinu",  en: "Plant care",       de: "Pflanzenpflege",       pl: "Pielęgnacja" },
  harvest:      { cs: "Doba sklizně",     en: "Harvest time",     de: "Erntezeit",            pl: "Czas zbiorów" },
  afterHarvest: { cs: "Po sklizni",       en: "After harvest",    de: "Nach der Ernte",       pl: "Po zbiorach" },
};

const CARE_LABELS: Record<string, Record<string, string>> = {
  easy:   { cs: "Snadná péče", en: "Easy",   de: "Einfach", pl: "Łatwa" },
  medium: { cs: "Střední péče", en: "Medium", de: "Mittel",  pl: "Średnia" },
  hard:   { cs: "Náročná péče", en: "Hard",   de: "Schwierig", pl: "Trudna" },
};
const CARE_COLORS = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  hard:   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function PlantInfoModal({ plantId, onClose }: PlantInfoModalProps) {
  const { lang } = useLang();
  const plant = PLANT_CATALOG.find(p => p.id === plantId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    // Zablokuj scroll pozadí
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!plant) return null;

  const name = plant.names[lang] ?? plant.names["cs"];
  const careLabel = CARE_LABELS[plant.careLevel][lang] ?? CARE_LABELS[plant.careLevel]["cs"];
  const careColor = CARE_COLORS[plant.careLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal – vystředěný obdélník, SCROLLOVATELNÝ VNITŘEK */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl"
        style={{ maxHeight: "calc(100vh - 80px)" }}>

        {/* Hlavička – fixní */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-stone-100 dark:border-gray-800 flex-shrink-0">
          <span className="text-4xl">{plant.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100 truncate">{name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${careColor}`}>{careLabel}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-gray-800 flex items-center justify-center text-stone-500 hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >✕</button>
        </div>

        {/* Obsah – scrollovatelný, má padding-bottom aby poslední položka nebyla skrytá */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2"
          style={{ WebkitOverflowScrolling: "touch" as never, paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
          {ROWS.map(({ key, icon }) => {
            const detail = plant.details[key as keyof typeof plant.details];
            const text = (detail as unknown as Record<string, string>)[lang] ?? (detail as unknown as Record<string, string>)["cs"];
            const label = ROW_LABELS[key][lang] ?? ROW_LABELS[key]["cs"];
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
          {/* Extra mezera dole – zabrání schovávání za navigaci */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
