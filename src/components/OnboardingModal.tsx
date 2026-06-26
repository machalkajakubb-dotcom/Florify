"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/AppContext";
import { LOCALES, type Locale } from "@/types";
import { createClient } from "@/utils/supabaseClient";

export default function OnboardingModal({ userId }: { userId: string }) {
  const { translate, setLocale, locale } = useLocale();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      city: city.trim(),
      locale: selectedLocale,
      onboarded: true,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      setError(translate("common.error"));
      setLoading(false);
      return;
    }

    setLocale(selectedLocale);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-5xl">🍅</span>
          <h2 className="text-xl font-bold text-leaf-900 mt-3">{translate("onboarding.title")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{translate("onboarding.city")}</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={translate("onboarding.cityPlaceholder")}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">{translate("onboarding.language")}</label>
            <div className="grid grid-cols-2 gap-2">
              {LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setSelectedLocale(loc.code)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    selectedLocale === loc.code
                      ? "border-leaf-600 bg-leaf-50 text-leaf-800"
                      : "border-gray-200 hover:border-leaf-200"
                  }`}
                >
                  {loc.flag} {loc.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? translate("common.loading") : translate("onboarding.continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
