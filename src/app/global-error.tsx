"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled root-level app error:", error);
  }, [error]);

  // global-error.tsx nahrazuje CELÝ root layout, takže musí mít vlastní
  // <html>/<body> – jinak to Next.js sestaví špatně.
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "24px",
          textAlign: "center", background: "#fafaf9", fontFamily: "system-ui, sans-serif",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/loading-tomato.png" alt="" width={64} height={64} style={{ marginBottom: 16, opacity: 0.8 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1c1917", marginBottom: 8 }}>
            Jejda, něco se pokazilo
          </h1>
          <p style={{ fontSize: 14, color: "#78716c", marginBottom: 24, maxWidth: 320 }}>
            V aplikaci nastala neočekávaná chyba. Zkuste to prosím znovu.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#16a34a", color: "white", fontWeight: 600,
              padding: "10px 20px", borderRadius: 16, border: "none", fontSize: 14,
            }}
          >
            Zkusit znovu
          </button>
        </div>
      </body>
    </html>
  );
}
