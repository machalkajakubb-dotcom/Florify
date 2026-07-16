import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Explicitně vynutíme Node.js runtime (ne Edge) – @google/genai to potřebuje.
export const runtime = "nodejs";

// gemini-3.5-flash je (červenec 2026) aktuální stabilní Flash model.
// gemini-2.5-flash byl vyřazen pro nové uživatele.
// Levnější/rychlejší alternativa s trochu nižší kvalitou: "gemini-3.1-flash-lite".
const MODEL = "gemini-3.5-flash";

export async function POST(req: NextRequest) {
  const { messages, city, plants, lang } = await req.json();

  const rawKey = process.env.GEMINI_API_KEY;
  // Nejčastější chyba při vkládání klíče do Vercel/​.env.local: omylem
  // vložené uvozovky nebo mezera/nový řádek navíc. To by způsobilo
  // "API key not valid" chybu i s jinak správným klíčem.
  const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");
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
    // Zalogujeme celou chybu do Vercel logů (Project → Deployments → Logs / Runtime Logs)
    console.error("Gemini chat error:", err);

    // Dočasně vracíme i skutečný text chyby přímo do chatu, ať je hned vidět,
    // co přesně selhává (špatný klíč, vypnuté API, špatný název proměnné...).
    // Až bude vše fungovat, klidně to smaž a vrať jen obecnou hlášku.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { content: `⚠️ Chyba komunikace s Gemini API:\n${detail}` },
      { status: 500 }
    );
  }
}
