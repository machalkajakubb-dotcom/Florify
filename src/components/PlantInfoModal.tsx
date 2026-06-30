"use client";

import { useEffect } from "react";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import { useLang } from "@/hooks/useLang";

interface PlantInfoModalProps {
  plantId: string;
  onClose: () => void;
}

const ROWS = [
  { key: "soilPrep",    icon: "🪱", labelCs: "Příprava záhonu" },
  { key: "whenToPlant", icon: "📅", labelCs: "Kdy zasadit" },
  { key: "spray",       icon: "🧴", labelCs: "Postřik" },
  { key: "fertilize",   icon: "🌿", labelCs: "Hnojení" },
  { key: "watering",    icon: "💧", labelCs: "Zálivka" },
  { key: "care",        icon: "✂️",  labelCs: "Péče o rostlinu" },
  { key: "harvest",     icon: "🧺", labelCs: "Doba sklizně" },
  { key: "afterHarvest",icon: "🍂", labelCs: "Péče po sklizni" },
] as const;

const ROW_LABELS: Record<string, Record<string,string>> = {
  soilPrep:    { cs:"Příprava záhonu", en:"Soil preparation", de:"Bodenorbereitung", pl:"Przygotowanie gleby" },
  whenToPlant: { cs:"Kdy zasadit",     en:"When to plant",    de:"Wann pflanzen",    pl:"Kiedy sadzić" },
  spray:       { cs:"Postřik",         en:"Spraying",         de:"Spritzen",         pl:"Opryskiwanie" },
  fertilize:   { cs:"Hnojení",         en:"Fertilizing",      de:"Düngung",          pl:"Nawożenie" },
  watering:    { cs:"Zálivka",         en:"Watering",         de:"Bewässerung",      pl:"Podlewanie" },
  care:        { cs:"Péče o rostlinu", en:"Plant care",       de:"Pflanzenpflege",   pl:"Pielęgnacja" },
  harvest:     { cs:"Doba sklizně",    en:"Harvest time",     de:"Erntezeit",        pl:"Czas zbiorów" },
  afterHarvest:{ cs:"Po sklizni",      en:"After harvest",    de:"Nach der Ernte",   pl:"Po zbiorach" },
};

export function PlantInfoModal({ plantId, onClose }: PlantInfoModalProps) {
  const { lang } = useLang();
  const plant = PLANT_CATALOG.find(p => p.id === plantId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!plant) return null;

  const name = plant.names[lang] ?? plant.names["cs"];
  const careLabelMap: Record<string, Record<string,string>> = {
    easy:   { cs:"Snadná", en:"Easy", de:"Einfach", pl:"Łatwa" },
    medium: { cs:"Střední", en:"Medium", de:"Mittel", pl:"Średnia" },
    hard:   { cs:"Náročná", en:"Hard", de:"Schwierig", pl:"Trudna" },
  };
  const careColors = { easy:"bg-emerald-100 text-emerald-700", medium:"bg-amber-100 text-amber-700", hard:"bg-red-100 text-red-700" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Hlavička */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <span className="text-4xl">{plant.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl text-bark-900 dark:text-gray-100">{name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${careColors[plant.careLevel]}`}>
              {careLabelMap[plant.careLevel][lang] ?? careLabelMap[plant.careLevel]["cs"]}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✕</button>
        </div>

        {/* Obsah */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3 scrollable">
          {ROWS.map(({ key, icon }) => {
            const detail = plant.details[key];
            const text = detail[lang as keyof typeof detail] ?? detail["cs" as keyof typeof detail];
            const label = ROW_LABELS[key][lang] ?? ROW_LABELS[key]["cs"];
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <p className="text-xs font-semibold text-forest-600 dark:text-forest-300 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm text-bark-800 dark:text-gray-300 leading-relaxed">{text as string}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
