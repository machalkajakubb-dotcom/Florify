"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AppContext";
import OnboardingModal from "@/components/OnboardingModal";
import WeatherWidget from "@/components/WeatherWidget";
import PlantGrid from "@/components/PlantGrid";
import Calendar from "@/components/Calendar";
import { useLocale } from "@/context/AppContext";

export default function HomePage() {
  const { user, profile, loading, signOut } = useAuth();
  const { translate } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{translate("common.loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  const needsOnboarding = !profile?.onboarded || !profile?.city;

  return (
    <>
      {needsOnboarding && <OnboardingModal userId={user.id} />}

      <div className="page-content space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-leaf-900">
              {translate("dashboard.greeting")} 🌿
            </h1>
            {profile?.city && (
              <p className="text-gray-500 text-sm mt-1">📍 {profile.city}</p>
            )}
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-gray-400 hover:text-gray-600 hidden md:block"
          >
            {translate("auth.logout")}
          </button>
        </header>

        <WeatherWidget />

        <div className="grid md:grid-cols-2 gap-6">
          <PlantGrid />
          <Calendar />
        </div>
      </div>
    </>
  );
}
