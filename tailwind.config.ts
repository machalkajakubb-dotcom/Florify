import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Přirozená lesní zelená – jarní list
        forest: {
          50:  "#f3f8f0",
          100: "#e3f0db",
          200: "#c5e0b4",
          300: "#9fca84",
          400: "#78b055",
          500: "#5a9636",
          600: "#437a26",
          700: "#346020",
          800: "#2b4d1d",
          900: "#243f19",
        },
        // Zemitá hnědá
        soil: {
          50:  "#faf6f0",
          100: "#f2e8d8",
          200: "#e4cfb0",
          300: "#d4b082",
          400: "#c3915a",
          500: "#b07840",
          600: "#946133",
          700: "#784d2b",
          800: "#5f3d24",
          900: "#4d311e",
        },
        // Kůra / tmavé texty
        bark: {
          700: "#3d3530",
          800: "#292524",
          900: "#1c1917",
        },
        // Stone – neutrální pozadí
        stone: {
          50:  "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [],
};

export default config;
