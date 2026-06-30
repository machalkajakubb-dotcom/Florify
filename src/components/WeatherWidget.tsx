"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/useLang";

interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
  rain_last_3h: number;
}

// OpenWeatherMap lang kódy
const OW_LANG: Record<string, string> = {
  cs: "cz", en: "en", de: "de", pl: "pl",
};

const MOCK_WEATHER: WeatherData = {
  city: "Praha", temp: 19, feels_like: 18,
  description: "Polojasno", icon: "02d",
  humidity: 62, wind: 2.8, rain_last_3h: 0,
};

const AI_TIPS: Record<string, string[]> = {
  cs: [
    "Dnes je ideální čas zalít ráno, před slunečním vrcholem.",
    "Zkontrolujte listy rajčat – při vlhku hrozí plíseň.",
    "Přidejte mulč kolem rostlin, ušetříte vodu až o 30 %.",
    "Hnojte jen při oblačném počasí, ne za přímého slunce.",
  ],
  en: [
    "Today is ideal for watering in the morning before peak sun.",
    "Check tomato leaves – humidity can cause blight.",
    "Add mulch around plants to save up to 30% water.",
    "Fertilize only on cloudy days, never in full sun.",
  ],
  de: [
    "Heute ideal zum Gießen am Morgen vor dem Sonnenhöchststand.",
    "Tomattenblätter prüfen – Feuchtigkeit kann Krautfäule verursachen.",
    "Mulch reduziert den Wasserverbrauch um bis zu 30 %.",
    "Nur bei bewölktem Wetter düngen, nie in praller Sonne.",
  ],
  pl: [
    "Dziś idealny czas na podlewanie rano, przed szczytem słońca.",
    "Sprawdź liście pomidorów – wilgotność sprzyja zarazie.",
    "Dodaj mulcz wokół roślin, oszczędzisz nawet 30% wody.",
    "Nawóź tylko przy pochmurnej pogodzie, nigdy w pełnym słońcu.",
  ],
};

// Odstraní diakritiku bezpečně – bez regex unicode escape v template literals
function removeDiacritics(str: string): string {
  return str
    .replace(/[áàäâ]/g, "a")
    .replace(/[ÁÀÄÂ]/g, "A")
    .replace(/[čć]/g, "c")
    .replace(/[ČĆ]/g, "C")
    .replace(/[ďđ]/g, "d")
    .replace(/[ĎĐ]/g, "D")
    .replace(/[éèëê]/g, "e")
    .replace(/[ÉÈËÊ]/g, "E")
    .replace(/[íìïî]/g, "i")
    .replace(/[ÍÌÏÎ]/g, "I")
    .replace(/[ňń]/g, "n")
    .replace(/[ŇŃ]/g, "N")
    .replace(/[óòöôő]/g, "o")
    .replace(/[ÓÒÖÔŐ]/g, "O")
    .replace(/[řŕ]/g, "r")
    .replace(/[ŘŔ]/g, "R")
    .replace(/[šś]/g, "s")
    .replace(/[ŠŚ]/g, "S")
    .replace(/[ťţ]/g, "t")
    .replace(/[ŤŢ]/g, "T")
    .replace(/[úùüûű]/g, "u")
    .replace(/[ÚÙÜÛŰ]/g, "U")
    .replace(/[ýÿ]/g, "y")
    .replace(/[ÝŸ]/g, "Y")
    .replace(/[žź]/g, "z")
    .replace(/[ŽŹ]/g, "Z")
    .replace(/[łĺ]/g, "l")
    .replace(/[ŁĹ]/g, "L");
}

function buildWeatherData(d: Record<string, unknown>): WeatherData {
  const main = d.main as Record<string, number>;
  const weather = (d.weather as Array<Record<string, string>>)[0];
  const wind = d.wind as Record<string, number>;
  const rain = d.rain as Record<string, number> | undefined;
  return {
    city: d.name as string,
    temp: Math.round(main.temp),
    feels_like: Math.round(main.feels_like),
    description: weather.description,
    icon: weather.icon,
    humidity: main.humidity,
    wind: Math.round(wind.speed * 10) / 10,
    rain_last_3h: rain?.["3h"] ?? 0,
  };
}

export function WeatherWidget({ city }: { city: string }) {
  const { t, lang } = useLang();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [tip] = useState(() => {
    const tips = AI_TIPS[lang] ?? AI_TIPS["cs"];
    return tips[Math.floor(Math.random() * tips.length)];
  });

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setFetchError(false);

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === "YOUR_KEY_HERE") {
      const timer = setTimeout(() => {
        setWeather({ ...MOCK_WEATHER, city });
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    const owLang = OW_LANG[lang] ?? "en";
    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

    const doFetch = (q: string) =>
      fetch(baseUrl + "?q=" + encodeURIComponent(q) + "&appid=" + apiKey + "&units=metric&lang=" + owLang)
        .then(r => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        });

    doFetch(city)
      .then(d => {
        setWeather(buildWeatherData(d));
        setLoading(false);
      })
      .catch(() => {
        const cityAscii = removeDiacritics(city);
        if (cityAscii !== city) {
          doFetch(cityAscii)
            .then(d => {
              setWeather(buildWeatherData(d));
              setLoading(false);
            })
            .catch(() => {
              setFetchError(true);
              setLoading(false);
            });
        } else {
          setFetchError(true);
          setLoading(false);
        }
      });
  }, [city, lang]);

  if (loading) {
    return (
      <div className="card animate-pulse-soft">
        <div className="h-28 flex items-center justify-center text-stone-400 text-sm">
          {t("dashboard_weather_loading")}
        </div>
      </div>
    );
  }

  if (fetchError || !weather) {
    return (
      <div className="card border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
        <p className="text-sm text-amber-700 dark:text-amber-300 text-center py-3">
          ⚠️ {t("error_weather")} – {city}
        </p>
      </div>
    );
  }

  const feelsLabel: Record<string, string> = {
    cs: "Pocitová", en: "Feels like", de: "Gefühlt", pl: "Odczuwalna",
  };
  const humLabel:  Record<string, string> = { cs:"Vlhkost",  en:"Humidity", de:"Feucht.",  pl:"Wilg." };
  const windLabel: Record<string, string> = { cs:"Vítr",     en:"Wind",     de:"Wind",     pl:"Wiatr" };
  const rainLabel: Record<string, string> = { cs:"Déšť/3h",  en:"Rain/3h",  de:"Regen",    pl:"Deszcz" };

  return (
    <div className="card animate-fade-slide-up overflow-hidden">
      {/* Gradient hlavička */}
      <div className="bg-gradient-to-br from-forest-500 to-forest-800 -mx-4 -mt-4 px-4 pt-4 pb-5 rounded-t-3xl mb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-forest-200 text-sm font-medium">{"📍 " + weather.city}</p>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-white text-5xl font-bold leading-none">{weather.temp}°</span>
              <span className="text-forest-300 text-lg mb-1">C</span>
            </div>
            <p className="text-forest-100 text-sm capitalize mt-1">{weather.description}</p>
            <p className="text-forest-300 text-xs mt-0.5">
              {feelsLabel[lang] ?? feelsLabel["cs"]}: {weather.feels_like}°C
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={"https://openweathermap.org/img/wn/" + weather.icon + "@2x.png"}
            alt={weather.description}
            className="w-16 h-16 -mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <WeatherStat icon="💧" val={weather.humidity + "%"}       label={humLabel[lang]  ?? humLabel["cs"]}  />
          <WeatherStat icon="💨" val={weather.wind + " m/s"}        label={windLabel[lang] ?? windLabel["cs"]} />
          <WeatherStat icon="🌧️" val={weather.rain_last_3h + " mm"} label={rainLabel[lang] ?? rainLabel["cs"]} />
        </div>
      </div>

      {/* AI tip */}
      <div className="flex gap-2 items-start">
        <span className="text-xl mt-0.5 flex-shrink-0">🌿</span>
        <div>
          <p className="text-[10px] font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wide mb-0.5">
            {t("dashboard_ai_tip")}
          </p>
          <p className="text-sm text-bark-800 dark:text-gray-300 leading-snug">{tip}</p>
        </div>
      </div>
    </div>
  );
}

function WeatherStat({ icon, val, label }: { icon: string; val: string; label: string }) {
  return (
    <div className="bg-white/15 rounded-xl px-2 py-1.5 text-center">
      <div className="text-base leading-tight">{icon}</div>
      <div className="text-white text-xs font-semibold">{val}</div>
      <div className="text-forest-300 text-[10px]">{label}</div>
    </div>
  );
}
