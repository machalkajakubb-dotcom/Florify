"use client";

import { useState } from "react";
import { useAuth, useLocale } from "@/context/AppContext";
import { PLANT_CATALOG } from "@/types";
import { createClient } from "@/utils/supabaseClient";

export default function PlantGrid() {
  const { plants, refreshPlants, user } = useAuth();
  const { translate } = useLocale();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const userPlantIds = plants.map((p) => p.plant_id);
  const availablePlants = PLANT_CATALOG.filter((p) => !userPlantIds.includes(p.id));

  const handleAdd = async () => {
    if (!user || !selectedPlant) return;
    setLoading(true);
    await supabase.from("user_plants").insert({
      user_id: user.id,
      plant_id: selectedPlant,
    });
    await refreshPlants();
    setSelectedPlant("");
    setShowAdd(false);
    setLoading(false);
  };

  const handleRemove = async (plantRowId: string) => {
    if (!user) return;
    setLoading(true);
    await supabase.from("user_plants").delete().eq("id", plantRowId);
    await refreshPlants();
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{translate("garden.title")}</h2>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary text-sm py-2 px-4"
          disabled={loading || availablePlants.length === 0}
        >
          + {translate("garden.addPlant")}
        </button>
      </div>

      {showAdd && availablePlants.length > 0 && (
        <div className="mb-4 p-4 bg-leaf-50 rounded-xl border border-leaf-100 flex flex-col sm:flex-row gap-3">
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="input flex-1"
          >
            <option value="">{translate("garden.selectPlant")}</option>
            {availablePlants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.emoji} {translate(`plants.${plant.id}`)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} className="btn-primary" disabled={!selectedPlant || loading}>
              {translate("common.save")}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
              {translate("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {plants.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{translate("garden.noPlants")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {plants.map((userPlant) => {
            const plant = PLANT_CATALOG.find((p) => p.id === userPlant.plant_id);
            if (!plant) return null;
            return (
              <div
                key={userPlant.id}
                className="relative bg-leaf-50 border border-leaf-100 rounded-2xl p-4 text-center group hover:shadow-md transition-shadow"
              >
                <span className="text-4xl block mb-2">{plant.emoji}</span>
                <p className="font-medium text-sm text-leaf-900">
                  {translate(`plants.${plant.id}`)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {translate(`garden.categories.${plant.category}`)}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemove(userPlant.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  disabled={loading}
                >
                  {translate("garden.removePlant")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
