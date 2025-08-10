/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "portfolio-light": {
          "primary":   "#4F46E5",   // indigo-600
          "secondary": "#06B6D4",   // cyan-500
          "accent":    "#F97316",   // orange-500
          "neutral":   "#111827",   // gray-900 (metin)
          "base-100":  "#FFFFFF",   // ana arkaplan
          "base-200":  "#F8FAFC",   // kart arkaplanı (slate-50)
          "base-300":  "#EEF2F7",   // çizgi/sınır (açık gri)
          "info":      "#2563EB",
          "success":   "#16A34A",
          "warning":   "#F59E0B",
          "error":     "#DC2626",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--tab-radius":  "0.6rem"
        }
      },
      "light" // fallback
    ]
  }
};
