import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f4ee",
        mint: "#b8f2d0",
        coral: "#ff7a59",
        ocean: "#1f7a8c"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(23, 32, 42, 0.12)"
      }
    }
  },
  plugins: [typography]
};

export default config;
