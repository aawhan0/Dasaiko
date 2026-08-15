/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      /* =====================================================
         COLORS
      ====================================================== */

      colors: {
        base: "#050505",

        surface: "#0C0C0C",

        hover: "#161616",

        ink: {
          DEFAULT: "#F5F5F5",
          secondary: "#A1A1AA",
          muted: "#71717A",
          faint: "#52525B",
        },

        border: {
          subtle:
            "rgba(255,255,255,0.08)",
          medium:
            "rgba(255,255,255,0.14)",
          strong:
            "rgba(255,255,255,0.22)",
        },

        primary: {
          DEFAULT: "#6366F1",
          50: "#EEEEFF",
          100: "#DEDEFE",
          200: "#BDBDFD",
          300: "#9C9CF9",
          400: "#7B7BF5",
          500: "#6366F1",
          600: "#4346E8",
          700: "#2E31D5",
          800: "#2528B0",
          900: "#1E218E",
        },

        secondary: {
          DEFAULT: "#A855F7",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
        },

        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
      },

      /* =====================================================
         TYPOGRAPHY
      ====================================================== */

      fontFamily: {
        heading: [
          "Geist",
          "Inter",
          "system-ui",
          "sans-serif",
        ],

        body: [
          "Inter",
          "system-ui",
          "sans-serif",
        ],

        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },

      fontWeight: {
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },

      /* =====================================================
         BORDERS
      ====================================================== */

      borderColor: {
        subtle:
          "rgba(255,255,255,0.08)",

        medium:
          "rgba(255,255,255,0.14)",

        strong:
          "rgba(255,255,255,0.22)",
      },

      /* =====================================================
         BACKGROUNDS
      ====================================================== */

      backgroundImage: {
        "gradient-radial":
          "radial-gradient(var(--tw-gradient-stops))",

        "gradient-primary":
          "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",

        "gradient-surface":
          "linear-gradient(180deg, #0C0C0C 0%, #050505 100%)",

        "gradient-brand":
          "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
      },

      /* =====================================================
         ANIMATION
      ====================================================== */

      animation: {
        shimmer:
          "shimmer 1.4s linear infinite",

        "pulse-slow":
          "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        "spin-slow":
          "spin 3s linear infinite",
      },

      keyframes: {
        shimmer: {
          "0%": {
            backgroundPosition:
              "-200% 0",
          },

          "100%": {
            backgroundPosition:
              "200% 0",
          },
        },
      },

      /* =====================================================
         SHADOWS
      ====================================================== */

      boxShadow: {
        card:
          "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",

        "card-strong":
          "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.08)",

        glow:
          "0 0 20px rgba(99,102,241,0.15)",

        "glow-sm":
          "0 0 10px rgba(99,102,241,0.10)",

        "glow-purple":
          "0 0 35px rgba(168,85,247,0.16)",
      },

      /* =====================================================
         BORDER RADIUS
      ====================================================== */

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },

  plugins: [],
};