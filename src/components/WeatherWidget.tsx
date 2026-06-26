"use client";

import { useEffect, useState } from "react";
import { useAuth, useLocale } from "@/context/AppContext";
import { getWeatherTip } from "@/utils/garden";
import type { WeatherData } from "@/types";

export default function WeatherWidget() {
  const { profile } = useAuth();
  const { locale, translate } = useLocale();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.city) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/weather?city=${encodeURIComponent(profile.city)}&locale=${locale}`
        );
        if (!res.ok) throw new Error("Weather fetch failed");
        const data: WeatherData = await res.json();
        setWeather(data);
        setTip(getWeatherTip(data.temp, data.description, locale));
      } catch {
        setError(translate("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [profile?.city, locale, translate]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-leaf-100 rounded w-1/3 mb-4" />
        <div className="h-16 bg-leaf-50 rounded" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card">
        <h2 className="section-title">{translate("dashboard.weather")}</h2>
        <p className="text-gray-500 text-sm">
          {profile?.city
            ? error || translate("common.error")
            : translate("onboarding.cityPlaceholder")}
        </p>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-sky-50 to-leaf-50 border-sky-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title">{translate("dashboard.weather")}</h2>
          <p className="text-sm text-gray-500">{weather.city}</p>
        </div>
        <span className="text-4xl">{weather.icon}</span>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <span className="text-5xl font-bold text-leaf-800">{Math.round(weather.temp)}°</span>
        <span className="text-gray-600 capitalize pb-2">{weather.description}</span>
      </div>

      <div className="flex gap-6 text-sm text-gray-600 mb-4">
        <span>💧 {translate("dashboard.humidity")}: {weather.humidity}%</span>
        <span>🌬️ {translate("dashboard.wind")}: {Math.round(weather.windSpeed)} m/s</span>
      </div>

      <div className="bg-white/70 rounded-xl p-4 border border-leaf-100">
        <p className="text-xs font-semibold text-leaf-700 uppercase tracking-wide mb-1">
          {translate("dashboard.todayTip")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}
