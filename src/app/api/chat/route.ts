import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

// Explicitně vynutíme Node.js runtime (ne Edge) – @google/genai to potřebuje.
export const runtime = "nodejs";

// gemini-3.1-flash-lite: aktuální (červenec 2026) stabilní, lehký a levný model.
// Podporuje i obrázky (multimodální vstup). Zvolen místo gemini-3.5-flash kvůli
// hlášeným výpadkům/nestabilitě – gemini-2.0-flash a gemini-1.5-flash jsou
// bohužel definitivně vypnuté (Google je zrušil v roce 2026), takže nejde použít.
const MODEL = "gemini-3.1-flash-lite";

interface IncomingImage {
  mimeType: string;
  data: string; // base64 bez "data:image/...;base64," prefixu
}

export async function POST(req: NextRequest) {
  const { messages, city, plants, lang, image } = await req.json() as {
    messages: { role: string; content: string }[];
    city: string;
    plants: string[];
    lang: string;
    image?: IncomingImage;
  };

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
Nikdy nedávej nebezpečné rady ohledně chemikálií bez varování.

Uživatel ti může poslat i fotku rostliny (např. podezřelé skvrny, plíseň,
škůdce, žloutnutí listů). Pokud fotku dostaneš, pozorně ji popiš z pohledu
zahradníka, over jestli tam vidíš problém, a poraď konkrétní další kroky.
Pokud si nejsi jistá diagnózou jen z fotky, řekni to a doporuč konzultaci
s místní zahradnickou poradnou, než navrhneš razantní zásah (např. chemický postřik).

KRITICKY DŮLEŽITÉ – FORMÁT ODPOVĚDI:
Odpověz VÝHRADNĚ finálním textem zprávy, kterou má uživatel uvidět v chatu – jako
by ji Flora napsala přímo jemu. Nikdy nepiš svůj myšlenkový postup, plánování,
"kroky" (např. "1. Understand the question", "Refining and shortening..."),
nadpisy, ani žádné meta-komentáře o tom, jak odpověď sestavuješ. Nezačínej
odpověď žádným úvodem typu "Dobře, tady je odpověď:" – rovnou piš to, co by
Flora řekla. Odpověď musí být krátká (ideálně 2–4 věty) a nesmí být uprostřed
uťatá – pokud je téma širší, radši ho zestruč, než abys odpověď nedokončil/a.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Gemini nezná roli "assistant" jako Anthropic/OpenAI – jeho odpovědi
    // mají roli "model". Historii zpráv proto musíme přemapovat.
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Pokud uživatel poslal fotku, přidáme ji jako další "part" k JEHO
    // poslední zprávě (poslední položka v contents = aktuální dotaz).
    if (image && contents.length > 0) {
      const last = contents[contents.length - 1];
      (last.parts as Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>).push({
        inlineData: { data: image.data, mimeType: image.mimeType },
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        // 1000 tokenů na SAMOTNOU odpověď – dřívějších 600 nestačilo, protože
        // si model bere tokeny navíc i na interní "přemýšlení" (thinking),
        // takže na finální text pak zbyl jen zlomek limitu a odpověď se uťala.
        maxOutputTokens: 1000,
        // gemini-3.1-flash-lite nedělá rozšířené "thinking" jako 3.5-flash,
        // ale pro jistotu necháváme na minimu, kdyby to model podporoval.
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
          includeThoughts: false,
        },
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
