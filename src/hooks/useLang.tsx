"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language } from "@/utils/supabaseClient";
import { PLANT_CATALOG } from "@/utils/plantCatalog";

import csDict from "@/locales/cs.json";
import enDict from "@/locales/en.json";
import deDict from "@/locales/de.json";
import plDict from "@/locales/pl.json";

const DICTS: Record<Language, Record<string, string>> = {
  cs: csDict as Record<string, string>,
  en: enDict as Record<string, string>,
  de: deDict as Record<string, string>,
  pl: plDict as Record<string, string>,
};

interface LangCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  plantName: (id: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "cs",
  setLang: () => {},
  t: (k) => k,
  plantName: (id) => id,
});

const VALID_LANGS: Language[] = ["cs", "en", "de", "pl"];

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    // OPRAVA: byl zde bitový OR (|) místo ?? – to způsobovalo že jazyk se nikdy nenačetl
    const saved = localStorage.getItem("florify_lang") as Language | null;
    if (saved && VALID_LANGS.includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("florify_lang", l);
  };

  const dict = DICTS[lang] ?? DICTS["cs"];
  const t = (key: string): string => dict[key] ?? DICTS["cs"][key] ?? key;

  const plantName = (id: string): string => {
    const plant = PLANT_CATALOG.find(p => p.id === id);
    if (!plant) return id;
    return plant.names[lang] ?? plant.names["cs"] ?? id;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, plantName }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
