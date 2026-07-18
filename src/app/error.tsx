"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Zaloguje chybu do konzole (dřív appka spadla úplně na bílo bez stopy,
    // teď aspoň víme, co přesně to vyvolalo)
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-stone-50 dark:bg-gray-950 safe-top safe-bottom">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/loading-tomato.png" alt="" className="w-16 h-16 mb-4 opacity-80" />
      <h1 className="font-display text-xl font-bold text-bark-900 dark:text-gray-100 mb-1.5">
        Jejda, něco se pokazilo
      </h1>
      <p className="text-sm text-stone-500 dark:text-gray-400 mb-6 max-w-xs">
        V aplikaci nastala neočekávaná chyba. Zkuste to prosím znovu – vaše
        data jsou v pořádku.
      </p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="btn-primary px-5 py-2.5 text-sm">
          Zkusit znovu
        </button>
        <button onClick={() => router.push("/")} className="btn-secondary px-5 py-2.5 text-sm">
          Domů
        </button>
      </div>
    </div>
  );
}
