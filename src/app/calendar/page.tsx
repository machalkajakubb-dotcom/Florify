"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { GardenCalendar } from "@/components/Calendar";
import type { Plant } from "@/utils/supabaseClient";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";


export default function CalendarPage() {
  const router = useRouter();
  const { t } = useLang();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase.from("plants").select("*").eq("user_id", user.id);
    setPlants(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable safe-top"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)" }}>
        <div className="max-w-lg mx-auto px-4 py-5">
          <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100 mb-5">{t("calendar_title")}</h1>
          {loading
            ? <div className="text-center py-12 text-stone-300 animate-pulse-soft text-4xl">📅</div>
            : <GardenCalendar plantIds={plants.map(p => p.plant_id)} />
          }
        </div>
      </main>
      <Navigation />
    </div>
  );
}
