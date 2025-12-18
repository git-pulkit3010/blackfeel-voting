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
        zinc: {
          50: "#fafafa",       // zinc-50
          100: "#f4f4f5",      // zinc-100
          200: "#e4e4e7",      // zinc-200
          300: "#d4d4d8",      // zinc-300
          400: "#a1a1aa",      // zinc-400
          500: "#71717a",      // zinc-500
          600: "#52525b",      // zinc-600
          700: "#3f3f46",      // zinc-700
          800: "#27272a",      // zinc-800
          900: "#18181b",      // zinc-900
          950: "#09090b",      // zinc-950
        },
      },
      borderRadius: {
        lg: "8px",           // rounded-lg
        xl: "12px",          // rounded-xl
        "2xl": "16px",       // rounded-2xl
      },
    },
  },
  plugins: [],
};
export default config;