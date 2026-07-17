"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { PlantGrid } from "@/components/PlantGrid";
import type { Plant } from "@/utils/supabaseClient";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";


export default function GardenPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("plants").select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    setPlants(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleAddPlant = async (pid: string, name: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("plants")
      .insert({ user_id: user.id, plant_id: pid, name, emoji, added_at: new Date().toISOString() })
      .select().single();
    if (data) setPlants(prev => [data, ...prev]);
  };

  const handleRemovePlant = async (id: string) => {
    await supabase.from("plants").delete().eq("id", id);
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  const countLabel = (n: number) => {
    const labels: Record<string, string[]> = {
      cs: ["rostlinu", "rostliny", "rostlin"],
      en: ["plant", "plants", "plants"],
      de: ["Pflanze", "Pflanzen", "Pflanzen"],
      pl: ["roślinę", "rośliny", "roślin"],
    };
    const l = labels[lang] ?? labels["cs"];
    return n === 1 ? `1 ${l[0]}` : n < 5 ? `${n} ${l[1]}` : `${n} ${l[2]}`;
  };

  const growingLabel: Record<string, string> = {
    cs: "Pěstujete", en: "Growing", de: "Sie pflanzen", pl: "Uprawiasz",
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable safe-top"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center gap-2 mb-1">
            <BackButton />
            <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">
              {t("dashboard_my_garden")}
            </h1>
          </div>
          <p className="text-sm text-forest-600 dark:text-forest-400 mb-5">
            {plants.length > 0
              ? `${growingLabel[lang] ?? growingLabel["cs"]} ${countLabel(plants.length)}`
              : t("dashboard_no_plants")}
          </p>

          {loading ? (
            <div className="flex justify-center py-12"><img src="/icons/loading-tomato.png" alt="" className="w-10 h-10 animate-pulse-soft" /></div>
          ) : (
            <div className="card">
              <PlantGrid
                plants={plants}
                onAdd={handleAddPlant}
                onRemove={handleRemovePlant}
              />
            </div>
          )}
        </div>
      </main>
      <Navigation />
    </div>
  );
}
