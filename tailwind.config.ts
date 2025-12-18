import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // New colors from design
        "accent-blue": "#3b82f6",
        "background-dark": "#000000",
        "card-dark": "#111111",
        "border-dark": "#333333",
        "text-primary": "#ffffff",
        "text-secondary": "#a1a1aa",
        "text-tertiary": "#71717a",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;