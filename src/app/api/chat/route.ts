import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage } from "@/types";

export async function POST(request: NextRequest) {
  const { messages, city, plants, locale } = await request.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const plantList = (plants as string[]).join(", ") || "none yet";

  const systemPrompt = `You are Flora, a friendly expert botanist and gardening assistant for the Florify app.
The user lives in ${city || "an unknown location"} and grows: ${plantList}.
Respond in language code "${locale}" (cs=Czech, en=English, de=German, pl=Polish).
Give practical, hyper-local gardening advice. Keep answers concise (2-4 sentences) unless asked for detail.
Consider the current season and local climate. Be warm and encouraging.`;

  if (!apiKey || apiKey.startsWith("sk-ant-api03-VAS")) {
    const lastUser = (messages as ChatMessage[]).filter((m) => m.role === "user").pop();
    return NextResponse.json({
      reply: getDemoReply(locale, lastUser?.content ?? "", city, plantList),
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: systemPrompt,
        messages: (messages as ChatMessage[]).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}

function getDemoReply(locale: string, question: string, city: string, plants: string): string {
  const replies: Record<string, string> = {
    cs: `Děkuji za otázku! Jsem Flora, váš zahradní asistent${city ? ` pro oblast ${city}` : ""}. Pěstujete: ${plants}. Pro plné AI odpovědi doplňte ANTHROPIC_API_KEY do .env.local. Tip: ${question.toLowerCase().includes("zalé") ? "Zalévejte ráno nebo večer, ne v poledne." : "Přidejte kompost na jaře pro zdravější rostliny."}`,
    en: `Thanks for your question! I'm Flora, your gardening assistant${city ? ` for ${city}` : ""}. You grow: ${plants}. Add ANTHROPIC_API_KEY to .env.local for full AI replies. Tip: ${question.toLowerCase().includes("water") ? "Water in the morning or evening, not at midday." : "Add compost in spring for healthier plants."}`,
    de: `Danke für Ihre Frage! Ich bin Flora${city ? ` für ${city}` : ""}. Sie pflanzen: ${plants}. Fügen Sie ANTHROPIC_API_KEY in .env.local hinzu. Tipp: Gießen Sie morgens oder abends.`,
    pl: `Dziękuję za pytanie! Jestem Flora${city ? ` dla ${city}` : ""}. Uprawiasz: ${plants}. Dodaj ANTHROPIC_API_KEY do .env.local. Wskazówka: Podlewaj rano lub wieczorem.`,
  };
  return replies[locale] ?? replies.en;
}
