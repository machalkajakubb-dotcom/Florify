import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/hooks/useLang";
import { ThemeProvider } from "@/hooks/useTheme";

export const metadata: Metadata = {
  title: "Florify – Chytrý zahradní asistent",
  description: "Hyper-lokální AI asistent pro zahrádkáře. Počasí, záhony, kalendář, chat s Florou.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Florify" },
  formatDetection: { telephone: false },
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
    <html lang="cs" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('florify_theme');if(t==='dark')document.documentElement.classList.add('dark');})()` }} />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider>{children}</LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
