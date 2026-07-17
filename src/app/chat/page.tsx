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

interface Message { id: string; role: "user" | "assistant"; content: string; ts: number; image?: string; }

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [infoPlantId, setInfoPlantId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ previewUrl: string; base64: string; mimeType: string } | null>(null);
  const [imageError, setImageError] = useState("");

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
    if ((!text && !pendingImage) || loading) return;
    const finalText = text || t("chat_image_default_prompt");
    const userMsg: Message = {
      id: `u-${Date.now()}`, role: "user", content: finalText, ts: Date.now(),
      image: pendingImage?.previewUrl,
    };
    const imageToSend = pendingImage;
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setLoading(true);
    try {
      const history = [...messages.filter(m => m.id !== "welcome"), userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          city: profile?.city ?? "neznámé",
          plants: plants.map(p => `${p.emoji} ${p.name}`),
          lang,
          image: imageToSend ? { mimeType: imageToSend.mimeType, data: imageToSend.base64 } : undefined,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: "assistant", content: data.content, ts: Date.now() }]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("chat_messages").insert([
        { user_id: user.id, role: "user", content: finalText },
        { user_id: user.id, role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Omlouvám se, nastala chyba. Zkuste to znovu.", ts: Date.now() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Zmenší fotku z mobilu (klidně 10+ MB) na rozumnou velikost před odesláním,
  // ať to nespadne na limitu velikosti requestu a zbytečně to nestojí tokeny.
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset, ať jde vybrat i stejný soubor znovu
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) {
      setImageError(t("chat_image_error_type"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1024;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1] ?? "";
        setPendingImage({ previewUrl: dataUrl, base64, mimeType: "image/jpeg" });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!initialized) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <img src="/icons/loading-tomato.png" alt="" className="w-12 h-12 animate-bounce" />
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
          paddingBottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom) + 92px)`,
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
              {msg.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={msg.image} alt="" className="rounded-2xl mb-2 max-h-48 w-auto object-cover" />
              )}
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

        {/* Náhled vybrané fotky před odesláním */}
        {pendingImage && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.previewUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-stone-200 dark:border-gray-700" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-700 dark:bg-gray-600 text-white text-xs flex items-center justify-center"
              >✕</button>
            </div>
            <p className="text-xs text-stone-400 dark:text-gray-500">{t("chat_image_ready")}</p>
          </div>
        )}
        {imageError && <p className="px-4 pt-2 text-xs text-red-500">{imageError}</p>}

        {/* Input */}
        <div className="px-4 py-3 flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl border border-stone-200 dark:border-gray-700 text-stone-500 dark:text-gray-400 hover:border-forest-300 hover:text-forest-600 transition-colors disabled:opacity-40"
            aria-label={t("chat_add_photo")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.132.175C3.098 7.57 2.25 8.507 2.25 9.622v9.128c0 1.128.902 2.036 2.021 2.036h15.458c1.119 0 2.021-.908 2.021-2.036V9.622c0-1.115-.848-2.052-1.804-2.217a48.11 48.11 0 00-1.132-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </button>
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
            disabled={(!input.trim() && !pendingImage) || loading}
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
