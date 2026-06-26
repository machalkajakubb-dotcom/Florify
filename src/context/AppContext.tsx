"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale, UserPlant, UserProfile } from "@/types";
import { getDictionary, t } from "@/utils/i18n";
import { createClient } from "@/utils/supabaseClient";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: ReturnType<typeof getDictionary>;
  translate: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = "cs",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = localStorage.getItem("florify-locale") as Locale | null;
    if (saved && ["en", "cs", "de", "pl"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("florify-locale", next);
  }, []);

  const dict = useMemo(() => getDictionary(locale), [locale]);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => t(dict, key, params),
    [dict]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dict, translate }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

interface AuthContextValue {
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  plants: UserPlant[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshPlants: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      setProfile(null);
      return;
    }

    setUser({ id: authUser.id, email: authUser.email });

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      setProfile({
        id: data.id,
        city: data.city ?? "",
        locale: data.locale ?? "cs",
        onboarded: data.onboarded ?? false,
      });
    }
  }, [supabase]);

  const refreshPlants = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setPlants([]);
      return;
    }

    const { data } = await supabase
      .from("user_plants")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: true });

    setPlants(data ?? []);
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPlants([]);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshProfile();
      await refreshPlants();
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshProfile();
      refreshPlants();
    });

    return () => subscription.unsubscribe();
  }, [supabase, refreshProfile, refreshPlants]);

  return (
    <AuthContext.Provider
      value={{ user, profile, plants, loading, refreshProfile, refreshPlants, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
