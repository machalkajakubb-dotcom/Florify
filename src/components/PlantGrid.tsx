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
}

export function PlantGrid({ plants, onAdd, onRemove }: PlantGridProps) {
  const { t, lang } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);

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
    // Vždy ukládáme plant_id – název se překládá za běhu z katalogu
    onAdd(plantId, plant.names[lang] ?? plant.names["cs"], plant.emoji);
    setShowModal(false);
    setSearch("");
  };

  return (
    <>
      {plants.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-sm">{t("dashboard_no_plants")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {plants.map(plant => {
            // Přeložíme název vždy z katalogu dle aktuálního jazyka
            const catalog = PLANT_CATALOG.find(p => p.id === plant.plant_id);
            const displayName = catalog
              ? (catalog.names[lang] ?? catalog.names["cs"])
              : plant.name;

            return (
              <PlantCard
                key={plant.id}
                plant={plant}
                displayName={displayName}
                onRemove={() => setConfirmRemove(plant.id)}
                onInfo={() => setInfoPlantId(plant.plant_id)}
              />
            );
          })}
        </div>
      )}

      {/* Přidat rostlinu */}
      <button onClick={() => setShowModal(true)} className="mt-4 w-full btn-secondary border-dashed">
        <span className="text-lg">+</span> {t("dashboard_add_plant")}
      </button>

      {/* Modal – výběr rostliny */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl px-4 pt-4 pb-8 max-h-[80vh] flex flex-col safe-bottom">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg dark:text-gray-100">{t("plant_add_title")}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("plant_add_search")}
              className="input-field mb-3" autoFocus
            />
            <div className="overflow-y-auto flex-1 scrollable">
              <div className="grid grid-cols-2 gap-2 pb-2">
                {filteredCatalog.map(plant => {
                  const name = plant.names[lang] ?? plant.names["cs"];
                  const already = addedIds.has(plant.id);
                  const careLabelMap: Record<string, Record<string,string>> = {
                    easy:   { cs:"Snadná", en:"Easy", de:"Einfach", pl:"Łatwa" },
                    medium: { cs:"Střední", en:"Medium", de:"Mittel", pl:"Średnia" },
                    hard:   { cs:"Náročná", en:"Hard", de:"Schwierig", pl:"Trudna" },
                  };
                  const careLabel = careLabelMap[plant.careLevel][lang] ?? careLabelMap[plant.careLevel]["cs"];
                  return (
                    <button
                      key={plant.id} disabled={already}
                      onClick={() => handleAdd(plant.id)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all
                        ${already
                          ? "bg-stone-50 dark:bg-gray-800 border-stone-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border-stone-100 dark:border-gray-700 hover:border-forest-400 hover:bg-forest-50 dark:hover:bg-gray-700 active:scale-95"
                        }`}
                    >
                      <span className="text-2xl">{plant.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-bark-900 dark:text-gray-100">{name}</p>
                        <p className="text-[10px] text-forest-500 dark:text-forest-400">{careLabel}</p>
                      </div>
                      {already && <span className="ml-auto text-forest-400 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Potvrzení odebrání */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmRemove(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full shadow-xl">
            <p className="text-center font-semibold mb-4 dark:text-gray-100">
              {lang==="cs"?"Odebrat rostlinu?":lang==="en"?"Remove plant?":lang==="de"?"Pflanze entfernen?":"Usunąć roślinę?"}
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 py-2.5 text-sm" onClick={() => setConfirmRemove(null)}>
                {t("cancel")}
              </button>
              <button
                className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                onClick={() => { onRemove(confirmRemove); setConfirmRemove(null); }}
              >
                {t("plant_remove_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {infoPlantId && <PlantInfoModal plantId={infoPlantId} onClose={() => setInfoPlantId(null)} />}
    </>
  );
}

function PlantCard({
  plant, displayName, onRemove, onInfo,
}: {
  plant: Plant;
  displayName: string;
  onRemove: () => void;
  onInfo: () => void;
}) {
  const added = new Date(plant.added_at).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-stone-100 dark:border-gray-700 p-3 flex flex-col items-center gap-1 shadow-sm group">
      <button onClick={onInfo} className="flex flex-col items-center gap-1 w-full">
        <span className="text-3xl">{plant.emoji}</span>
        <p className="text-xs font-semibold text-bark-900 dark:text-gray-100 text-center leading-tight">{displayName}</p>
        <p className="text-[10px] text-forest-400">{added}</p>
        <span className="text-[9px] text-forest-500 dark:text-forest-400 bg-forest-50 dark:bg-forest-950 px-1.5 py-0.5 rounded-full mt-0.5">
          ℹ info
        </span>
      </button>
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
        aria-label="Odebrat"
      >✕</button>
    </div>
  );
}
