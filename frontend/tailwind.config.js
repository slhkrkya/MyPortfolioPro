/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "portfolio-light": {
          "primary":   "#4F46E5",
          "secondary": "#06B6D4",
          "accent":    "#F97316",
          "neutral":   "#111827",
          "base-100":  "#FFFFFF",
          "base-200":  "#F8FAFC",
          "base-300":  "#E5E7EB",
          "info":      "#2563EB",
          "success":   "#16A34A",
          "warning":   "#F59E0B",
          "error":     "#DC2626",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--tab-radius":  "0.6rem"
        },
        // 👇 koyu tema
        "portfolio-dark": {
          "primary":   "#818CF8",     // indigo-400
          "secondary": "#22D3EE",     // cyan-400
          "accent":    "#FB923C",     // orange-400
          "neutral":   "#E5E7EB",     // açık metin
          "base-100":  "#0B0F19",     // ana arkaplan
          "base-200":  "#0F172A",     // panel
          "base-300":  "#1F2937",     // çizgi
          "info":      "#60A5FA",
          "success":   "#22C55E",
          "warning":   "#FBBF24",
          "error":     "#F87171",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--tab-radius":  "0.6rem"
        }
      },
      "light", // fallback
      "dark"
    ],
    // (opsiyonel) sistem tercihini kullandırmak istersen:
    // darkTheme: "portfolio-dark",
  },
};
