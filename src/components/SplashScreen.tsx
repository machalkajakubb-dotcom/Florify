"use client";
import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1800);
    const t2 = setTimeout(() => setVisible(false), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    >
      {/* Logo – ikona /icons/icon-192x192.png, poměr 1:1, doporučená velikost 140×140 px */}
      {/* Vlož soubor public/icons/icon-192x192.png – kawaii rajče */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192x192.png"
        alt="Florify"
        width={140}
        height={140}
        style={{ borderRadius: "32px" }}
        className="shadow-xl mb-5"
      />
      <h1 className="font-display text-3xl font-bold text-forest-700">Florify</h1>
      <p className="text-sm text-stone-400 mt-1">Váš chytrý zahradní asistent</p>

      {/* Jemná animovaná tečky pod logem */}
      <div className="flex gap-1.5 mt-6">
        {[0, 200, 400].map(delay => (
          <span
            key={delay}
            className="w-2 h-2 rounded-full bg-forest-400 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
