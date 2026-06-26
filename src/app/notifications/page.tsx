"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLocale } from "@/context/AppContext";
import { createClient } from "@/utils/supabaseClient";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const { user, profile, plants, loading } = useAuth();
  const { translate } = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !profile?.city) return;

    const load = async () => {
      setFetching(true);

      // Generate weather-based notifications via API
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          city: profile.city,
          plantIds: plants.map((p) => p.plant_id),
          locale: profile.locale,
        }),
      });

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(data ?? []);
      setFetching(false);
    };

    load();
  }, [user, profile, plants, supabase]);

  if (loading || !user) {
    return (
      <div className="page-content flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{translate("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="text-2xl font-bold text-leaf-900 mb-6">
        {translate("notifications.title")}
      </h1>

      {fetching ? (
        <p className="text-gray-500">{translate("common.loading")}</p>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl">🔔</span>
          <p className="text-gray-500 mt-4">{translate("notifications.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`card flex items-start gap-3 ${n.read ? "opacity-60" : ""}`}
            >
              <span className="text-2xl">
                {n.type === "water" ? "💧" : n.type === "frost" ? "❄️" : n.type === "heat" ? "☀️" : "🌿"}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {translate(`notifications.${n.message_key}`, {
                  ...(n.params as Record<string, string | number>),
                  plant: n.params?.plant
                    ? translate(`plants.${n.params.plant}`)
                    : "",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
