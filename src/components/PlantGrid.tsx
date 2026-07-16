"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/hooks/useLang";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import { PlantInfoModal } from "@/components/PlantInfoModal";
import type { Plant } from "@/utils/supabaseClient";

interface PlantGridProps {
  plants: Plant[];
  onAdd: (plantId: string, name: string, emoji: string) => void;
  onRemove: (id: string) => void;
  maxVisible?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function PlantGrid({ plants, onAdd, onRemove, maxVisible, showViewAll, onViewAll }: PlantGridProps) {
  const { t, lang } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);
  const [removeFromInfoId, setRemoveFromInfoId] = useState<string | null>(null);

  const visiblePlants = maxVisible ? plants.slice(0, maxVisible) : plants;
  const hiddenCount = maxVisible ? Math.max(0, plants.length - maxVisible) : 0;

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return PLANT_CATALOG.filter(p =>
      (p.names[lang] ?? p.names["cs"]).toLowerCase().includes(q)
    );
  }, [search, lang]);

  const addedIds = new Set(plants.map(p => p.plant_id));

  const handleAdd = (plantId: string) => {
    const plant = PLANT_CATALOG.find(p => p.id === plantId);
    if (!plant) return;
    onAdd(plantId, plant.names[lang] ?? plant.names["cs"], plant.emoji);
    setShowModal(false);
    setSearch("");
  };

  const handleRemoveFromInfo = () => {
    if (removeFromInfoId) {
      onRemove(removeFromInfoId);
      setRemoveFromInfoId(null);
      setInfoPlantId(null);
    }
  };

  const viewAllLabel: Record<string, string> = {
    en: `View all (${hiddenCount} more)`,
    cs: `Zobrazit vše (${hiddenCount} dalších)`,
    de: `Alle anzeigen (${hiddenCount} weitere)`,
    pl: `Pokaż wszystkie (${hiddenCount} więcej)`,
  };

  return (
    <>
      {plants.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-sm">{t("dashboard_no_plants")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {visiblePlants.map(plant => {
              const catalog = PLANT_CATALOG.find(p => p.id === plant.plant_id);
              const displayName = catalog
                ? (catalog.names[lang] ?? catalog.names["cs"])
                : plant.name;
              return (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  displayName={displayName}
                  onTap={() => {
                    setRemoveFromInfoId(plant.id);
                    setInfoPlantId(plant.plant_id);
                  }}
                />
              );
            })}
          </div>
          {showViewAll && hiddenCount > 0 && (
            <button
              onClick={onViewAll}
              className="mt-3 w-full text-sm text-forest-600 dark:text-forest-400 font-medium py-2.5 rounded-2xl border border-forest-100 dark:border-forest-900 hover:bg-forest-50 dark:hover:bg-forest-950 transition-colors"
            >
              {viewAllLabel[lang] ?? viewAllLabel["en"]}
            </button>
          )}
        </>
      )}

      {/* Přidat rostlinu */}
      <button onClick={() => setShowModal(true)} className="mt-4 w-full btn-primary">
        <span className="text-lg">+</span> {t("dashboard_add_plant")}
      </button>

      {/* Modal výběr */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowModal(false); setSearch(""); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4 flex flex-col"
            style={{ maxHeight: "80vh", paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t("plant_add_title")}</h3>
              <button className="btn-ghost" onClick={() => { setShowModal(false); setSearch(""); }}>✕</button>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("plant_add_search")}
              className="input-field mb-3"
            />
            <div className="overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="grid grid-cols-2 gap-2 pb-4">
                {filteredCatalog.map(plant => {
                  const name = plant.names[lang] ?? plant.names["cs"];
                  const already = addedIds.has(plant.id);
                  return (
                    <button
                      key={plant.id}
                      disabled={already}
                      onClick={() => handleAdd(plant.id)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
                        already
                          ? "bg-stone-50 dark:bg-gray-800 border-stone-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border-stone-100 dark:border-gray-700 hover:border-forest-400 hover:bg-forest-50 dark:hover:bg-gray-700 active:scale-95"
                      }`}
                    >
                      <span className="text-2xl">{plant.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-bark-900 dark:text-gray-100 truncate">{name}</p>
                        <p className="text-[10px] text-forest-500 dark:text-forest-400">{plant.careLevel}</p>
                      </div>
                      {already && <span className="ml-auto text-forest-400 text-xs flex-shrink-0">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info modal – s tlačítkem smazat nahoře */}
      {infoPlantId && (
        <PlantInfoModal
          plantId={infoPlantId}
          onClose={() => { setInfoPlantId(null); setRemoveFromInfoId(null); }}
          onRemove={handleRemoveFromInfo}
        />
      )}
    </>
  );
}

// ── PlantCard – klik na celou bunku = info + možnost smazat ──────────────────
function PlantCard({ plant, displayName, onTap }: {
  plant: Plant;
  displayName: string;
  onTap: () => void;
}) {
  // Hezká barevná ikona z katalogu místo prostého emoji
  const catalog = PLANT_CATALOG.find(p => p.id === plant.plant_id);
  const emoji = catalog?.emoji ?? plant.emoji;

  return (
    <button
      onClick={onTap}
      className="relative bg-white dark:bg-gray-800 rounded-2xl border border-stone-100 dark:border-gray-700 shadow-sm p-3 flex flex-col items-center gap-2 w-full active:scale-95 transition-transform"
    >
      {/* Emoji v barevném kruhu – výraznější než prosté emoji */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-50 to-forest-100 dark:from-forest-950 dark:to-forest-900 border border-forest-200 dark:border-forest-800 flex items-center justify-center text-2xl shadow-sm">
        {emoji}
      </div>
      <p className="text-xs font-semibold text-bark-900 dark:text-gray-100 text-center leading-tight w-full truncate">
        {displayName}
      </p>
    </button>
  );
}
