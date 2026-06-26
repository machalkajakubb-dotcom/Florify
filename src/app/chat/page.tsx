"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLocale } from "@/context/AppContext";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  const { user, profile, plants, loading } = useAuth();
  const { translate } = useLocale();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (profile?.city && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: translate("chat.welcome", { city: profile.city }),
        },
      ]);
    }
  }, [profile?.city, translate, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          city: profile?.city ?? "",
          plants: plants.map((p) => p.plant_id),
          locale: profile?.locale ?? "cs",
        }),
      });

      const data = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: translate("common.error") },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="page-content flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{translate("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="page-content flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-3xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-leaf-900">{translate("chat.title")}</h1>
        {profile?.city && (
          <p className="text-sm text-gray-500">📍 {profile.city}</p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-leaf-600 text-white rounded-br-md"
                  : "bg-white border border-leaf-100 text-gray-800 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-xs font-semibold text-leaf-600 block mb-1">🌸 Flora</span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-leaf-100 rounded-2xl px-4 py-3 text-sm text-gray-400">
              {translate("chat.thinking")}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 sticky bottom-20 md:bottom-4 bg-earth-50 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={translate("chat.placeholder")}
          className="input flex-1"
          disabled={sending}
        />
        <button type="submit" className="btn-primary px-5" disabled={sending || !input.trim()}>
          {translate("chat.send")}
        </button>
      </form>
    </div>
  );
}
