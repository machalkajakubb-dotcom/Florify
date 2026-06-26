"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/AppContext";
import { createClient } from "@/utils/supabaseClient";

export default function LoginPage() {
  const { translate } = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isSignup) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Check your email to confirm registration.");
        router.push("/");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-leaf-50 to-earth-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🍅</span>
          <h1 className="text-3xl font-bold text-leaf-900 mt-4">{translate("auth.welcome")}</h1>
          <p className="text-gray-500 mt-2">{translate("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">{translate("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">{translate("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-leaf-600 text-sm">{message}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading
              ? translate("common.loading")
              : isSignup
                ? translate("auth.signup")
                : translate("auth.login")}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isSignup ? translate("auth.hasAccount") : translate("auth.noAccount")}{" "}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-leaf-600 font-semibold hover:underline"
            >
              {isSignup ? translate("auth.login") : translate("auth.signup")}
            </button>
          </p>
        </form>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Florify
          </Link>
        </p>
      </div>
    </div>
  );
}
