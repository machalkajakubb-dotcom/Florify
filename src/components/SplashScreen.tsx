"use client";
import { useEffect, useState } from "react";

const TAGLINES: Record<string, string> = {
  en: "Your smart garden assistant",
  cs: "Váš chytrý zahradní asistent",
  de: "Ihr smarter Gartenassistent",
  pl: "Twój inteligentny asystent ogrodnika",
};

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("florify_lang") ?? "en";
    setLang(saved);
    const t1 = setTimeout(() => setFadeOut(true), 1800);
    const t2 = setTimeout(() => setVisible(false), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-950"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease", pointerEvents: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192x192.png" alt="Florify" width={140} height={140}
        style={{ borderRadius: "32px" }} className="shadow-xl mb-5" />
      <h1 className="font-display text-3xl font-bold text-forest-700 dark:text-forest-300">Florify</h1>
      <p className="text-sm text-stone-400 mt-1">{TAGLINES[lang] ?? TAGLINES["en"]}</p>
      <div className="flex gap-1.5 mt-6">
        {[0, 200, 400].map(d => (
          <span key={d} className="w-2 h-2 rounded-full bg-forest-400 animate-bounce"
            style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}
