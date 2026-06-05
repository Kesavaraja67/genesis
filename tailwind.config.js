/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === BACKGROUNDS === */
        bg: {
          base:     "#0D0D0F",
          DEFAULT:  "#0D0D0F",
          surface:  "#141418",
          elevated: "#1C1C22",
          overlay:  "#222229",
          input:    "#18181E",
        },
        /* === BORDERS === */
        border: {
          subtle:  "#2A2A33",
          DEFAULT: "#363640",
          focus:   "#4A6C6F",
          error:   "#AF5D63",
        },
        /* === TEXT === */
        text: {
          primary:   "#C0BCB5",
          secondary: "#7A7870",
          disabled:  "#4A4A50",
          inverse:   "#0D0D0F",
          link:      "#4A6C6F",
        },
        /* === BRAND === */
        pine: {
          DEFAULT: "#4A6C6F",
          hover:   "#5D8385",
          muted:   "#2D4547",
        },
        lavender: {
          DEFAULT: "#846075",
          hover:   "#9B7389",
          muted:   "#3D2D38",
        },
        mauve: {
          DEFAULT: "#AF5D63",
          hover:   "#C4727A",
          muted:   "#3D2326",
        },
        silver: {
          DEFAULT: "#C0BCB5",
          muted:   "#2A2A2F",
        },
        /* === SEMANTIC === */
        success: {
          DEFAULT: "#5A9E7A",
          muted:   "#1D3328",
        },
        warning: {
          DEFAULT: "#B8935A",
          muted:   "#312510",
        },
        error: {
          DEFAULT: "#AF5D63",
          muted:   "#3D2326",
        },
        info: {
          DEFAULT: "#4A6C6F",
          muted:   "#1A2D2E",
        },
        /* === LEGACY ALIASES (for backwards-compat with existing components) === */
        primary: {
          DEFAULT: "#4A6C6F",
          hover:   "#5D8385",
          light:   "#7AA8AB",
          muted:   "#2D4547",
        },
        accent: {
          DEFAULT: "#846075",
          hover:   "#9B7389",
        },
        muted: "#7A7870",
      },

      fontFamily: {
        display: ["DM Sans", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
        sans:    ["DM Sans", "sans-serif"],
      },

      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs:    ["13px", { lineHeight: "1.4" }],
        sm:    ["13px", { lineHeight: "1.6" }],
        base:  ["15px", { lineHeight: "1.6" }],
        md:    ["17px", { lineHeight: "1.5" }],
        lg:    ["20px", { lineHeight: "1.4" }],
        xl:    ["24px", { lineHeight: "1.3" }],
        "2xl": ["30px", { lineHeight: "1.2" }],
        "3xl": ["38px", { lineHeight: "1.2" }],
        "4xl": ["48px", { lineHeight: "1.1" }],
      },

      borderRadius: {
        xs:   "2px",
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl":"24px",
        full: "9999px",
      },

      boxShadow: {
        sm:     "0 1px 3px rgba(0,0,0,0.4)",
        md:     "0 4px 12px rgba(0,0,0,0.5)",
        lg:     "0 8px 32px rgba(0,0,0,0.6)",
        pine:   "0 0 20px rgba(74,108,111,0.2)",
        inset:  "inset 0 1px 0 rgba(255,255,255,0.04)",
        /* Legacy alias */
        glow:         "0 0 20px rgba(74,108,111,0.2)",
        "glow-accent": "0 0 20px rgba(132,96,117,0.2)",
      },

      letterSpacing: {
        tight:   "-0.02em",
        normal:  "0em",
        wide:    "0.04em",
        widest:  "0.12em",
      },

      animation: {
        "fade-in":     "fadeIn 200ms ease-out",
        "slide-up":    "slideUp 250ms ease-out",
        "slide-in-r":  "slideInRight 250ms ease-out",
        "scale-in":    "scaleIn 250ms cubic-bezier(0.34,1.56,0.64,1)",
        "pulse-dot":   "pulseDot 2s ease-in-out infinite",
        shimmer:       "shimmer 1.5s infinite linear",
        twinkle:       "twinkle 4s ease-in-out infinite",
        spin:          "spin 0.7s linear infinite",
        "spin-slow":   "spin 3s linear infinite",
      },

      keyframes: {
        fadeIn:       { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(110%)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:      { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulseDot:     { "0%, 100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        shimmer:      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        twinkle:      { "0%, 100%": { opacity: "0.1" }, "50%": { opacity: "0.4" } },
        spin:         { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
};
