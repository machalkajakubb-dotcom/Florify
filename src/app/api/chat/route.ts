import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, city, plants, lang } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Mock odpověď bez API klíče
    return NextResponse.json({
      content: "🌿 (Demo režim) Jsem Flora, vaše AI botanička! Abyste mohli chatovat se mnou naplno, přidejte ANTHROPIC_API_KEY do .env.local souboru.",
    });
  }

  const plantList = (plants as string[]).join(", ") || "žádné zatím";

  const systemPrompt = `Jsi Flora, přátelská a znalá AI botanička pro aplikaci Florify.
Uživatel žije v: ${city}.
Aktuálně pěstuje: ${plantList}.
Odpovídej v jazyce: ${lang}.
Buď stručná, praktická a přátelská. Používej emoji střídmě (1-2 na zprávu).
Vždy bery v úvahu roční období a místní podnebí.
Nikdy nedávej nebezpečné rady ohledně chemikálií bez varování.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "Omlouvám se, nepodařilo se mi odpovědět.";
    return NextResponse.json({ content: text });
  } catch {
    return NextResponse.json(
      { content: "Chyba při komunikaci s AI. Zkuste to znovu." },
      { status: 500 }
    );
  }
}
