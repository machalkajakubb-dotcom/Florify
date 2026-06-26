import { PLANT_CATALOG } from "@/types";
import type { Locale } from "@/types";

export function getTasksForMonth(plantIds: string[], month: number): string[] {
  const tasks = new Set<string>();

  for (const plantId of plantIds) {
    const plant = PLANT_CATALOG.find((p) => p.id === plantId);
    if (plant?.months.includes(month)) {
      plant.taskKeys.forEach((key) => tasks.add(key));
    }
  }

  if (month >= 3 && month <= 10) {
    tasks.add("general_weed");
  }
  if (month >= 4 && month <= 9) {
    tasks.add("general_compost");
  }

  return Array.from(tasks);
}

export function getPlantEmoji(plantId: string): string {
  return PLANT_CATALOG.find((p) => p.id === plantId)?.emoji ?? "🌱";
}

export function formatTemperature(temp: number, locale: Locale): string {
  return `${Math.round(temp)}°C`;
}

export function getWeatherTip(
  temp: number,
  description: string,
  locale: Locale
): string {
  const tips: Record<Locale, Record<string, string>> = {
    cs: {
      hot: "Dnes bude horko – zalévejte až večer, ať se voda neodpaří.",
      rain: "Dnes prší – ideální den na přesazování a mulčování.",
      cold: "Chladno – chráněte citlivé sazenice folií nebo clonou.",
      sunny: "Slunečno – skvělý den na sklizeň a kontrolu škůdců.",
      default: "Příjemný den na zahradu – nezapomeňte kontrolovat vlhkost půdy.",
    },
    en: {
      hot: "Hot today – water in the evening to reduce evaporation.",
      rain: "Rainy day – perfect for transplanting and mulching.",
      cold: "Chilly – protect sensitive seedlings with fleece or cloche.",
      sunny: "Sunny – great day for harvesting and pest checks.",
      default: "Nice gardening day – check soil moisture regularly.",
    },
    de: {
      hot: "Heiß heute – abends gießen, damit weniger Wasser verdunstet.",
      rain: "Regnerisch – ideal zum Umpflanzen und Mulchen.",
      cold: "Kühl – empfindliche Pflanzen mit Vlies schützen.",
      sunny: "Sonnig – guter Tag für Ernte und Schädlingskontrolle.",
      default: "Schöner Gartentag – Bodenfeuchtigkeit prüfen.",
    },
    pl: {
      hot: "Gorąco – podlewaj wieczorem, żeby woda nie wyparowała.",
      rain: "Deszczowo – idealny dzień na przesadzanie i mulczowanie.",
      cold: "Chłodno – chroń wrażliwe sadzonki agrowłókniną.",
      sunny: "Słonecznie – świetny dzień na zbiór i kontrolę szkodników.",
      default: "Miły dzień w ogrodzie – sprawdzaj wilgotność gleby.",
    },
  };

  const desc = description.toLowerCase();
  const t = tips[locale] ?? tips.en;

  if (temp > 28) return t.hot;
  if (desc.includes("rain") || desc.includes("déšť") || desc.includes("regen") || desc.includes("deszcz"))
    return t.rain;
  if (temp < 10) return t.cold;
  if (desc.includes("clear") || desc.includes("sun") || desc.includes("jasno") || desc.includes("sonn") || desc.includes("słonecz"))
    return t.sunny;
  return t.default;
}
