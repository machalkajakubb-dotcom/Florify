"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";

export const dynamic = "force-dynamic";

const T = {
  en: { title: "Set a new password", password: "New password", confirm: "Confirm password", save: "Save new password",
        mismatch: "Passwords don't match.", tooShort: "Password must be at least 6 characters.",
        success: "✅ Password changed! Redirecting to login...", invalidLink: "This reset link is invalid or has expired. Please request a new one from the login page.",
        backToLogin: "Back to login", passwordPlaceholder: "min. 6 characters" },
  cs: { title: "Nastavte nové heslo", password: "Nové heslo", confirm: "Potvrďte heslo", save: "Uložit nové heslo",
        mismatch: "Hesla se neshodují.", tooShort: "Heslo musí mít alespoň 6 znaků.",
        success: "✅ Heslo bylo změněno! Přesměrovávám na přihlášení...", invalidLink: "Tento odkaz pro obnovení hesla je neplatný nebo vypršel. Vyžádejte si prosím nový na přihlašovací stránce.",
        backToLogin: "Zpět na přihlášení", passwordPlaceholder: "min. 6 znaků" },
  de: { title: "Neues Passwort festlegen", password: "Neues Passwort", confirm: "Passwort bestätigen", save: "Neues Passwort speichern",
        mismatch: "Die Passwörter stimmen nicht überein.", tooShort: "Das Passwort muss mindestens 6 Zeichen haben.",
        success: "✅ Passwort geändert! Weiterleitung zur Anmeldung...", invalidLink: "Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
        backToLogin: "Zurück zur Anmeldung", passwordPlaceholder: "min. 6 Zeichen" },
  pl: { title: "Ustaw nowe hasło", password: "Nowe hasło", confirm: "Potwierdź hasło", save: "Zapisz nowe hasło",
        mismatch: "Hasła się nie zgadzają.", tooShort: "Hasło musi mieć co najmniej 6 znaków.",
        success: "✅ Hasło zostało zmienione! Przekierowuję do logowania...", invalidLink: "Ten link jest nieprawidłowy lub wygasł. Poproś o nowy na stronie logowania.",
        backToLogin: "Powrót do logowania", passwordPlaceholder: "min. 6 znaków" },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T["en"];

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase automaticky (detectSessionInUrl) zpracuje token z odkazu v e-mailu
    // a nastaví dočasnou "recovery" session. Počkáme na potvrzující událost,
    // nebo rovnou zkontrolujeme, jestli session existuje.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    setError("");
    if (password.length < 6) { setError(t.tooShort); return; }
    if (password !== confirm) { setError(t.mismatch); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-50 dark:from-gray-950 to-white dark:to-gray-900 flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-5 animate-fade-slide-up">
        <div className="text-center">
          <div className="text-6xl mb-3">🔑</div>
          <h1 className="font-display text-2xl font-bold text-garden-800 dark:text-garden-300">{t.title}</h1>
        </div>

        {success ? (
          <div className="bg-garden-50 dark:bg-garden-950 border border-garden-200 dark:border-garden-800 rounded-2xl px-4 py-3 text-sm text-garden-700 dark:text-garden-400 text-center">
            {t.success}
          </div>
        ) : !ready ? (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300 text-center space-y-3">
            <p>{t.invalidLink}</p>
            <button onClick={() => router.push("/login")} className="btn-secondary w-full text-sm">{t.backToLogin}</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-1">{t.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder={t.passwordPlaceholder} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-bark-700 dark:text-gray-300 mb-1">{t.confirm}</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input-field" autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleSave} disabled={loading || !password || !confirm}
              className="btn-primary w-full text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </span>
              ) : t.save}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
