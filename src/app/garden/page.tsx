"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLocale } from "@/context/AppContext";
import PlantGrid from "@/components/PlantGrid";

export default function GardenPage() {
  const { user, loading } = useAuth();
  const { translate } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="page-content flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{translate("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="text-2xl font-bold text-leaf-900 mb-6">{translate("garden.title")}</h1>
      <PlantGrid />
    </div>
  );
}
