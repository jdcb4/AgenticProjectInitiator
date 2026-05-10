import type { Config } from "tailwindcss";

/**
 * Tailwind config — semantic-token mode.
 *
 * Every colour, font size, and tracking value here points at a CSS custom
 * property defined in src/styles/tokens.css. Add new tokens THERE first,
 * then expose them here as a Tailwind class. Do not put hex values, raw
 * pixel sizes, or computed colours in this file.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // shadcn-compatible primitives — required for shadcn add commands.
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",

        // Semantic surfaces.
        surface: {
          base: "hsl(var(--surface-base) / <alpha-value>)",
          raised: "hsl(var(--surface-raised) / <alpha-value>)",
          overlay: "hsl(var(--surface-overlay) / <alpha-value>)",
          sunken: "hsl(var(--surface-sunken) / <alpha-value>)",
        },

        // Semantic text — used as bg-* / text-* via these keys.
        // Use the "text-" prefix in classes (text-text-primary, text-text-secondary).
        text: {
          primary: "hsl(var(--text-primary) / <alpha-value>)",
          secondary: "hsl(var(--text-secondary) / <alpha-value>)",
          subtle: "hsl(var(--text-subtle) / <alpha-value>)",
          "on-accent": "hsl(var(--text-on-accent) / <alpha-value>)",
        },

        // Semantic accents.
        "accent-primary": "hsl(var(--accent-primary) / <alpha-value>)",
        "accent-success": "hsl(var(--accent-success) / <alpha-value>)",
        "accent-warning": "hsl(var(--accent-warning) / <alpha-value>)",
        "accent-danger": "hsl(var(--accent-danger) / <alpha-value>)",
        "accent-info": "hsl(var(--accent-info) / <alpha-value>)",

        // Semantic borders.
        "border-default": "hsl(var(--border-default) / <alpha-value>)",
        "border-subtle": "hsl(var(--border-subtle) / <alpha-value>)",
        "border-strong": "hsl(var(--border-strong) / <alpha-value>)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        display: [
          "var(--font-size-display)",
          {
            lineHeight: "var(--line-height-tight)",
            letterSpacing: "var(--tracking-tighter)",
          },
        ],
        h1: [
          "var(--font-size-h1)",
          {
            lineHeight: "var(--line-height-tight)",
            letterSpacing: "var(--tracking-tight)",
          },
        ],
        h2: [
          "var(--font-size-h2)",
          {
            lineHeight: "var(--line-height-snug)",
            letterSpacing: "var(--tracking-tight)",
          },
        ],
        h3: [
          "var(--font-size-h3)",
          { lineHeight: "var(--line-height-snug)" },
        ],
        h4: [
          "var(--font-size-h4)",
          { lineHeight: "var(--line-height-snug)" },
        ],
        body: [
          "var(--font-size-body)",
          { lineHeight: "var(--line-height-normal)" },
        ],
        "body-sm": [
          "var(--font-size-body-sm)",
          { lineHeight: "var(--line-height-normal)" },
        ],
        caption: [
          "var(--font-size-caption)",
          {
            lineHeight: "var(--line-height-snug)",
            letterSpacing: "var(--tracking-wide)",
          },
        ],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
    },
  },
  plugins: [],
};

export default config;
