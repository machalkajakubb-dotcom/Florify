import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PWA-friendly headers */
  headers: async () => [
    {
      source: "/manifest.json",
      headers: [{ key: "Content-Type", value: "application/manifest+json" }],
    },
  ],
};

export default nextConfig;
