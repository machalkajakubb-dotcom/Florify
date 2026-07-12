"use client";
import { useRouter } from "next/navigation";

export function BackButton({ to = "/mygarden" }: { to?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(to)}
      aria-label="Zpět"
      className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full text-bark-900 dark:text-gray-100 active:bg-stone-100 dark:active:bg-gray-800 transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  );
}
