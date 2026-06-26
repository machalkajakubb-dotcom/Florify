import type { Locale } from "@/types";
import en from "@/locales/en.json";
import cs from "@/locales/cs.json";
import de from "@/locales/de.json";
import pl from "@/locales/pl.json";

const dictionaries = { en, cs, de, pl } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

type Dictionary = typeof en;

export function t(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let value: unknown = dict;

  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof value !== "string") return key;

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [k, v]) => text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v)),
    value
  );
}
