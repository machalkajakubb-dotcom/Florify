import type { MetadataRoute } from "next";

// Next.js z tohohle souboru automaticky vygeneruje /robots.txt.
// Pokud nastavíš NEXT_PUBLIC_SITE_URL ve Vercelu na svou skutečnou doménu,
// sitemap odkaz se automaticky opraví.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://florimy.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Přihlašovací/nastavení stránky a API routy nemá smysl indexovat.
        disallow: ["/api/", "/settings", "/reset-password"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
