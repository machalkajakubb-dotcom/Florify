import type { MetadataRoute } from "next";

// Next.js z tohohle souboru automaticky vygeneruje /sitemap.xml.
// Pokud nastavíš NEXT_PUBLIC_SITE_URL ve Vercelu na svou skutečnou doménu,
// odkazy se automaticky opraví.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://florimy.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Jen veřejně smysluplné, indexovatelné stránky (ne /settings, /reset-password,
  // ani stránky vyžadující přihlášení, které Google stejně neuvidí smysluplně).
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/login", priority: 0.6, changeFrequency: "monthly" },
    { path: "/mygarden", priority: 0.8, changeFrequency: "weekly" },
    { path: "/garden", priority: 0.7, changeFrequency: "weekly" },
    { path: "/beds", priority: 0.7, changeFrequency: "weekly" },
    { path: "/harvest", priority: 0.7, changeFrequency: "weekly" },
    { path: "/products", priority: 0.7, changeFrequency: "weekly" },
    { path: "/calendar", priority: 0.7, changeFrequency: "weekly" },
    { path: "/chat", priority: 0.7, changeFrequency: "weekly" },
    { path: "/game", priority: 0.6, changeFrequency: "weekly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
