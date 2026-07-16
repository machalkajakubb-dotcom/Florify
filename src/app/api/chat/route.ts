import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  const { messages, city, plants, lang } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Mock odpověď bez API klíče
    return NextResponse.json({
      content: "🌿 (Demo režim) Jsem Flora, vaše AI botanička! Abyste mohli chatovat se mnou naplno, přidejte GEMINI_API_KEY do .env.local souboru.",
    });
  }

  const plantList = (plants as string[]).join(", ") || "žádné zatím";

  const systemPrompt = `Jsi Flora, přátelská a znalá AI botanička pro aplikaci Florimy.
Uživatel žije v: ${city}.
Aktuálně pěstuje: ${plantList}.
Odpovídej v jazyce: ${lang}.
Buď stručná, praktická a přátelská. Používej emoji střídmě (1-2 na zprávu).
Vždy bery v úvahu roční období a místní podnebí.
Nikdy nedávej nebezpečné rady ohledně chemikálií bez varování.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Gemini nezná roli "assistant" jako Anthropic/OpenAI – jeho odpovědi
    // mají roli "model". Historii zpráv proto musíme přemapovat.
    const contents = (messages as { role: string; content: string }[]).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 600,
      },
    });

    const text = response.text ?? "Omlouvám se, nepodařilo se mi odpovědět.";
    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json(
      { content: "Chyba při komunikaci s AI. Zkuste to znovu." },
      { status: 500 }
    );
  }
}
