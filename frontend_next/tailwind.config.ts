import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        civic: {
          ink: "#0A1020",
          mist: "#F6F8FC",
          cyan: "#22D3EE",
          blue: "#3B82F6",
          lime: "#A3E635",
          rose: "#FB7185",
          amber: "#F59E0B",
        },
      },
      boxShadow: {
        glow: "0 0 45px rgba(34, 211, 238, 0.24)",
        soft: "0 18px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(rgba(15,23,42,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.06) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
