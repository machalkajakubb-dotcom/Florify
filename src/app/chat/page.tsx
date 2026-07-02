"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useLang } from "@/hooks/useLang";
import { Navigation } from "@/components/Navigation";
import { PlantInfoModal } from "@/components/PlantInfoModal";
import { PLANT_CATALOG } from "@/utils/plantCatalog";
import type { Plant, UserProfile } from "@/utils/supabaseClient";

// Vynutí dynamické (server-time) renderování – zabrání selhání
// statického prerenderingu na buildu kvůli chybějícím env proměnným.
export const dynamic = "force-dynamic";

interface Message { id: string; role: "user" | "assistant"; content: string; ts: number; }

const QUICK: Record<string, string[]> = {
  cs: ["Kdy zalít rajčata?", "Jaký hnůj je nejlepší?", "Jak bojovat s mšicemi?", "Co sázet tento měsíc?"],
  en: ["When to water tomatoes?", "Best fertilizer?", "How to fight aphids?", "What to plant this month?"],
  de: ["Wann Tomaten gießen?", "Bester Dünger?", "Blattläuse bekämpfen?", "Was diesen Monat pflanzen?"],
  pl: ["Kiedy podlewać pomidory?", "Najlepszy nawóz?", "Jak walczyć z mszycami?", "Co sadzić w tym miesiącu?"],
};

// Výška navigační lišty (přibližná, pro paddingBottom výpočet)
const NAV_HEIGHT = 64;

export default function ChatPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const [{ data: prof }, { data: userPlants }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("plants").select("*").eq("user_id", user.id),
    ]);
    setProfile(prof);
    setPlants(userPlants ?? []);
    setMessages([{ id: "welcome", role: "assistant", content: t("chat_welcome"), ts: Date.now() }]);
    setInitialized(true);
  }, [router, t]);

  useEffect(() => { init(); }, [init]);

  // Scroll na novou zprávu
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages.filter(m => m.id !== "welcome"), userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, city: profile?.city ?? "neznámé", plants: plants.map(p => `${p.emoji} ${p.name}`), lang }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: "assistant", content: data.content, ts: Date.now() }]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("chat_messages").insert([
        { user_id: user.id, role: "user", content: text },
        { user_id: user.id, role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Omlouvám se, nastala chyba. Zkuste to znovu.", ts: Date.now() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!initialized) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <div className="text-4xl animate-bounce">🌿</div>
    </div>
  );

  return (
    <div className="flex flex-col bg-stone-50 dark:bg-gray-950"
      style={{ height: "100dvh" }}>  {/* dvh = dynamic viewport height, správně na iOS Safari */}

      {/* ── Hlavička – iOS safe area aware ─────────────────────────────── */}
      <header
        className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 flex items-center gap-3 flex-shrink-0"
        style={{
          // safe-area-inset-top je na iPhone s notchem 44-59px, na starých 0px
          // Přidáváme 16px pod safe area pro pohodlí
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "14px",
        }}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-xl shadow-md flex-shrink-0">🌿</div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-base text-bark-900 dark:text-gray-100 leading-tight">Flora</h1>
          <p className="text-xs text-forest-500 dark:text-forest-400 truncate">
            AI {lang === "cs" ? "Botanička" : lang === "en" ? "Botanist" : lang === "de" ? "Botanikerin" : "Botaniczka"} · {profile?.city}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-forest-400 animate-pulse" />
          <span className="text-xs text-stone-400">online</span>
        </div>
      </header>

      {/* ── Rychlé tagy rostlin ─────────────────────────────────────────── */}
      {plants.length > 0 && (
        <div
          className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {plants.map(p => {
            const cat = PLANT_CATALOG.find(c => c.id === p.plant_id);
            return (
              <button key={p.id} onClick={() => cat && setInfoPlantId(cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-forest-50 dark:bg-forest-950 border border-forest-100 dark:border-forest-900 px-2.5 py-1 rounded-full text-xs text-forest-700 dark:text-forest-300 hover:bg-forest-100 transition-colors">
                {p.emoji} {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Oblast zpráv – scrollovatelná, bere zbytek výšky ───────────── */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 pt-4 space-y-3"
        style={{
          // Spodní padding = výška navigace + safe area + input area
          // Aby poslední zpráva byla vidět celá nad vstupním polem
          paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom) + 80px)`,
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 animate-fade-slide-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-forest-100 dark:bg-forest-900 flex items-center justify-center text-sm flex-shrink-0">🌿</div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-forest-600 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-900 text-bark-900 dark:text-gray-100 rounded-bl-sm border border-stone-100 dark:border-gray-800"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-forest-100 dark:bg-forest-900 flex items-center justify-center text-sm">🌿</div>
            <div className="bg-white dark:bg-gray-900 rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm border border-stone-100 dark:border-gray-800">
              <div className="flex gap-1 items-center h-5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}

        {/* Anchor pro auto-scroll – extra výška zaručuje viditelnost */}
        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>

      {/* ── Spodní oblast – fixní nad navigací ─────────────────────────── */}
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-stone-100 dark:border-gray-800"
        style={{
          // Odsunout přesně nad Navigation lištu
          paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
        }}
      >
        {/* Rychlé otázky */}
        {messages.length <= 1 && (
          <div
            className="px-4 pt-3 pb-0 flex gap-2 overflow-x-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {(QUICK[lang] ?? QUICK["en"]).map(q => (
              <button key={q}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className="flex-shrink-0 text-xs bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-forest-700 dark:text-forest-300 px-3 py-2 rounded-full hover:bg-forest-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={t("chat_placeholder")}
            className="flex-1 input-field py-2.5 text-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-2.5 rounded-2xl disabled:opacity-40 flex-shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>

      <Navigation />
      {infoPlantId && <PlantInfoModal plantId={infoPlantId} onClose={() => setInfoPlantId(null)} />}
    </div>
  );
}
