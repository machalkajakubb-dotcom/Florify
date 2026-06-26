"use client";

import { useEffect } from "react";
import { useAuth, useLocale } from "@/context/AppContext";
import type { Locale } from "@/types";

/** Syncs Supabase profile locale into the UI language picker. */
export default function LocaleSync() {
  const { profile } = useAuth();
  const { setLocale } = useLocale();

  useEffect(() => {
    if (profile?.locale) {
      setLocale(profile.locale as Locale);
    }
  }, [profile?.locale, setLocale]);

  return null;
}
