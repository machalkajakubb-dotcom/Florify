"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { Navigation } from "@/components/Navigation";
import type { Language, UserProfile } from "@/utils/supabaseClient";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";


const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "cs", label: "Čeština",  flag: "🇨🇿" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "pl", label: "Polski",   flag: "🇵🇱" },
];

function IgIcon()   { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>; }
function FbIcon()   { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function TtIcon()   { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>; }
function YtIcon()   { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>; }
function MailIcon() { return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>; }

const SOCIAL = [
  { name: "Instagram", href: "https://instagram.com/florify.app",  color: "text-pink-500",    Icon: IgIcon },
  { name: "Facebook",  href: "https://facebook.com/florify.app",   color: "text-blue-600",    Icon: FbIcon },
  { name: "TikTok",    href: "https://tiktok.com/@florify.app",    color: "text-bark-900 dark:text-white", Icon: TtIcon },
  { name: "YouTube",   href: "https://youtube.com/@florify",       color: "text-red-500",     Icon: YtIcon },
  { name: "E-mail",    href: "mailto:ahoj@florify.app",            color: "text-forest-600 dark:text-forest-400", Icon: MailIcon },
];

// ── Smazání účtu ─────────────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, lang }: { onClose: () => void; lang: Language }) {
  const router = useRouter();
  const { t } = useLang();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Potvrzovací slovo dle jazyka
  const CONFIRM_WORD: Record<Language, string> = {
    cs: "SMAZAT", en: "DELETE", de: "LÖSCHEN", pl: "USUŃ",
  };
  const word = CONFIRM_WORD[lang];

  const handleDelete = async () => {
    if (confirmText !== word) return;
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Smazání dat z DB (cascade smaže vše)
      await supabase.from("profiles").delete().eq("id", user.id);

      // Odhlášení
      await supabase.auth.signOut();
      router.push("/login");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Chyba při mazání účtu.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{t("auth_delete_account")}</h3>
          <p className="text-sm text-stone-500 dark:text-gray-400 mt-2">{t("auth_delete_confirm")}</p>
          <p className="text-xs text-red-500 mt-2 font-medium">{t("auth_delete_warning")}</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-500 dark:text-gray-400 mb-2">
            {t("auth_delete_type")}: <span className="font-bold text-red-500">{word}</span>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="input-field border-red-200 dark:border-red-800 focus:ring-red-400"
            placeholder={word}
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">{t("auth_delete_cancel")}</button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== word || loading}
            className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "..." : t("auth_delete_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hlavní stránka nastavení ─────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [city, setCity] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) { setProfile(data); setCity(data.city ?? ""); }
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!profile || !city.trim()) return;
    await supabase.from("profiles").update({ city: city.trim(), language: lang }).eq("id", profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const themeLabel = {
    light: { cs:"Světlý režim", en:"Light mode", de:"Hellmodus", pl:"Tryb jasny" },
    dark:  { cs:"Tmavý režim",  en:"Dark mode",  de:"Dunkelmodus", pl:"Tryb ciemny" },
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-gray-950">
      <main className="flex-1 scrollable pb-24 safe-top">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

          <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">{t("settings_title")}</h1>

          {loading ? (
            <div className="text-center py-12 text-stone-300 animate-pulse-soft text-4xl">⚙️</div>
          ) : (<>

            {/* Profil */}
            <section className="card space-y-3">
              <h2 className="text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wide">👤 Profil</h2>
              <div>
                <label className="block text-sm font-medium text-bark-700 dark:text-gray-300 mb-1">{t("settings_city")}</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder="Vaše město..." />
              </div>
              <p className="text-xs text-stone-400 dark:text-gray-600">{profile?.email}</p>
            </section>

            {/* Jazyk */}
            <section className="card space-y-3">
              <h2 className="text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wide">🌍 {t("settings_lang")}</h2>
              <div className="grid grid-cols-2 gap-2">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      lang === l.code
                        ? "border-forest-500 bg-forest-50 dark:bg-forest-950 text-forest-800 dark:text-forest-200 font-semibold"
                        : "border-stone-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-bark-700 dark:text-gray-300 hover:border-forest-300"
                    }`}>
                    <span>{l.flag}</span><span className="text-sm">{l.label}</span>
                    {lang === l.code && <span className="ml-auto text-forest-500">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* Vzhled */}
            <section className="card">
              <h2 className="text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wide mb-3">🎨 Vzhled</h2>
              <button onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-100 dark:border-gray-700 hover:bg-forest-50 dark:hover:bg-gray-800 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{theme === "light" ? "☀️" : "🌙"}</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">{themeLabel[theme][lang]}</p>
                    <p className="text-xs text-stone-400 dark:text-gray-500">
                      {lang==="cs"?"Klepnutím přepnete":lang==="en"?"Tap to toggle":lang==="de"?"Tippen zum Umschalten":"Dotknij aby przełączyć"}
                    </p>
                  </div>
                </div>
                <div className={`relative w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-forest-600" : "bg-stone-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>
            </section>

            {/* Uložit */}
            <button onClick={handleSave} className="btn-primary w-full">
              {saved ? "✅ " + t("beds_saved") : t("settings_save")}
            </button>

            {/* Sociální sítě */}
            <section className="card">
              <h2 className="text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wide mb-3">📱 Florify online</h2>
              <div className="space-y-1">
                {SOCIAL.map(({ name, href, color, Icon }) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-forest-50 dark:hover:bg-gray-800 transition-all group">
                    <span className={`${color} group-hover:scale-110 transition-transform`}><Icon /></span>
                    <span className="text-sm font-medium text-bark-800 dark:text-gray-200">{name}</span>
                    <span className="ml-auto text-stone-300 dark:text-gray-600 text-xs">→</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-center text-stone-300 dark:text-gray-600 pt-3 mt-2 border-t border-stone-100 dark:border-gray-800">ahoj@florify.app</p>
            </section>

            {/* Odhlásit */}
            <button onClick={handleSignOut}
              className="w-full py-3 rounded-2xl border-2 border-stone-200 dark:border-gray-700 text-stone-500 dark:text-gray-400 font-semibold hover:bg-stone-100 dark:hover:bg-gray-800 transition-all">
              {t("auth_sign_out")}
            </button>

            {/* Nebezpečná zóna */}
            <section className="card border-red-100 dark:border-red-900">
              <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">⚠️ {t("settings_danger_zone")}</h2>
              <p className="text-xs text-stone-400 dark:text-gray-500 mb-3">{t("auth_delete_warning")}</p>
              <button onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                🗑 {t("auth_delete_account")}
              </button>
            </section>

            <p className="text-center text-xs text-stone-300 dark:text-gray-700 pb-2">Florify v0.1.0 · Made with 🌱</p>
          </>)}
        </div>
      </main>
      <Navigation />
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} lang={lang} />}
    </div>
  );
}
