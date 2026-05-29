// tailwind.config.ts — merge this into your config so you can use classes like
// `bg-brand`, `text-cloud`, `rounded-card`, `shadow-card`, `font-display`.
// Tokens reference the CSS variables in globals.css, so they stay the single source
// of truth and you can theme later without touching components.

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        midnight: "var(--color-midnight)",
        navy: "var(--color-navy)",
        steel: "var(--color-steel)",
        line: "var(--color-line)",
        cloud: "var(--color-cloud)",
        mist: "var(--color-mist)",
        muted: "var(--color-muted)",
        brand: {
          DEFAULT: "var(--color-brand)",
          deep: "var(--color-brand-deep)",
        },
        onbrand: "var(--color-onbrand)",
        accent: "var(--color-accent)",
        marker: "var(--color-marker)",
        coral: "var(--color-coral)",
      },
      borderRadius: {
        card: "var(--radius-card)", // 1.25rem
        xl: "var(--radius-xl)",     // 0.75rem
      },
      boxShadow: {
        card: "0 18px 40px -18px rgba(20,35,60,0.30), 0 2px 8px -4px rgba(20,35,60,0.16)",
        soft: "0 16px 40px -20px rgba(20,35,60,0.28)",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      maxWidth: {
        card: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
