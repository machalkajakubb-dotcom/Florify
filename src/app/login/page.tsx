"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";


export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Vyplňte prosím e-mail i heslo.");
      return;
    }
    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Zakáže email potvrzení – uživatel se přihlásí ihned
            emailRedirectTo: undefined,
          },
        });

        if (err) throw err;

        // Pokud Supabase vrátí session hned, přesměrujeme
        if (data.session) {
          router.push("/");
          return;
        }

        // Pokud je potřeba ověření e-mailem
        if (data.user && !data.session) {
          setSuccess("✅ Účet vytvořen! Zkontrolujte e-mail pro potvrzení, nebo se zkuste přihlásit.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          if (err.message.includes("Invalid login credentials")) {
            throw new Error("Špatný e-mail nebo heslo. Zkontrolujte přihlašovací údaje.");
          }
          if (err.message.includes("Email not confirmed")) {
            throw new Error("E-mail ještě nebyl ověřen. Zkontrolujte svou schránku.");
          }
          throw err;
        }
        router.push("/");
      }
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Nastala neočekávaná chyba.";
      // "Failed to fetch" / "Load failed" obvykle znamená, že Supabase URL
      // nebo klíč nejsou na serveru správně nastavené (chybí env proměnné na Vercelu).
      if (msg.includes("Failed to fetch") || msg.includes("Load failed") || msg.includes("NetworkError")) {
        msg = isSupabaseConfigured
          ? "Nelze se připojit k Supabase. Zkontrolujte internetové připojení nebo zda je projekt v Supabase aktivní (nepozastavený)."
          : "Aplikace není správně nakonfigurovaná – chybí přístupové údaje k Supabase. Kontaktujte prosím správce aplikace (chybí NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY v nastavení Vercelu).";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-50 dark:from-gray-950 to-white dark:to-gray-900 flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-6 animate-fade-slide-up">
        {/* Logo */}
        <div className="text-center">
          <div className="text-6xl mb-3">🌱</div>
          <h1 className="font-display text-3xl font-bold text-garden-800 dark:text-garden-300">Florify</h1>
          <p className="text-garden-600 dark:text-garden-400 mt-1 text-sm">{t("tagline")}</p>
        </div>

        {/* Varování při chybějící konfiguraci Supabase */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            ⚠️ Aplikace zatím není plně nakonfigurovaná (chybí připojení k databázi). Přihlášení nebude fungovat, dokud nebudou na Vercelu nastaveny proměnné <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> a <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </div>
        )}

        {/* Přepínač */}
        <div className="flex bg-garden-100 dark:bg-gray-800 rounded-2xl p-1">
          <button
            onClick={() => { setIsSignUp(false); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              !isSignUp
                ? "bg-white dark:bg-gray-700 text-garden-700 dark:text-garden-300 shadow-sm"
                : "text-garden-500 dark:text-gray-400"
            }`}
          >
            {t("auth_sign_in")}
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              isSignUp
                ? "bg-white dark:bg-gray-700 text-garden-700 dark:text-garden-300 shadow-sm"
                : "text-garden-500 dark:text-gray-400"
            }`}
          >
            {t("auth_sign_up")}
          </button>
        </div>

        {/* Formulář */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-1">
              {t("auth_email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="vas@email.cz"
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-1">
              {t("auth_password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="min. 6 znaků"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {isSignUp && (
              <p className="text-xs text-garden-500 mt-1 ml-1">Heslo musí mít alespoň 6 znaků</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-garden-50 dark:bg-garden-950 border border-garden-200 dark:border-garden-800 rounded-2xl px-4 py-3 text-sm text-garden-700 dark:text-garden-400">
              {success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="btn-primary w-full text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("loading")}
              </span>
            ) : isSignUp ? t("auth_sign_up") : t("auth_sign_in")}
          </button>
        </div>

        {/* Info o Supabase email confirm */}
        {isSignUp && (
          <p className="text-center text-xs text-garden-500 dark:text-gray-500 leading-relaxed">
            Po registraci vám může přijít ověřovací e-mail.<br />
            Pokud ne, zkuste se rovnou přihlásit.
          </p>
        )}

        <div className="flex justify-center gap-4 text-2xl opacity-30">
          🍅🥕🥒🌿🍓
        </div>
      </div>
    </div>
  );
}
