import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/hooks/useLang";
import { ThemeProvider } from "@/hooks/useTheme";
import { SplashScreen } from "@/components/SplashScreen";

// POZOR PRO PROVOZOVATELE: nastav v proměnných prostředí (Vercel) klíč
// NEXT_PUBLIC_SITE_URL na skutečnou doménu appky (např. https://florimy.app),
// jinak se použije níže uvedená záložní hodnota – uprav si ji podle potřeby.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://florimy.vercel.app";

// Klíčová slova ve všech 4 jazycích appky, aby appku šlo najít bez ohledu na
// to, v jakém jazyce člověk hledá (Google beztak bere <meta name="keywords">
// jen jako slabý signál, hlavní váhu má obsah stránky a odkazy zvenčí, ale
// neuškodí to mít vyplněné).
const KEYWORDS = [
  // čeština
  "Florimy", "aplikace pro zahrádkáře", "zahradnická aplikace", "chytrá zahrada",
  "plánovač záhonů", "zahradnický kalendář", "AI botanička", "péče o rostliny",
  "moje zahrada", "sklizeň aplikace",
  // english
  "Florimy", "gardening app", "smart garden assistant", "garden planner",
  "raised bed planner", "gardening calendar", "AI plant doctor", "plant care app",
  "harvest tracker", "vegetable garden app",
  // deutsch
  "Gartenapp", "Garten-App", "smarter Gartenassistent", "Beetplaner",
  "Gartenkalender", "KI-Pflanzendoktor", "Pflanzenpflege App", "Ernte-Tracker",
  // polski
  "aplikacja dla ogrodników", "aplikacja ogrodnicza", "planer grządek",
  "kalendarz ogrodniczy", "asystent AI dla ogrodu", "pielęgnacja roślin",
  "śledzenie zbiorów",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Florimy – Your Smart Garden Assistant",
    template: "%s | Florimy",
  },
  description: "Hyper-local AI assistant for gardeners. Weather, garden beds, calendar, chat with Flora.",
  keywords: KEYWORDS,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Florimy" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Florimy",
    title: "Florimy – Your Smart Garden Assistant",
    description: "Hyper-local AI assistant for gardeners. Weather, garden beds, calendar, chat with Flora.",
    locale: "en",
    alternateLocale: ["cs_CZ", "de_DE", "pl_PL"],
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "Florimy" }],
  },
  twitter: {
    card: "summary",
    title: "Florimy – Your Smart Garden Assistant",
    description: "Hyper-local AI assistant for gardeners. Weather, garden beds, calendar, chat with Flora.",
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#437a26",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Appka má vlastní kompletní překlad do 4 jazyků – nechceme, aby to
            prohlížeč (hlavně Chrome na Androidu) "opravoval" svým automatickým
            překladem, který umí běžná slova zprznit na nesmysly. */}
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="cs, en, de, pl" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('florify_theme');if(t==='dark')document.documentElement.classList.add('dark');})()` }} />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider>
            <SplashScreen />
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
