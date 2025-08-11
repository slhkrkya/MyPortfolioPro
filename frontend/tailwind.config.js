// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      // animasyon/gradient vb. burada genişletilebilir
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "portfolio-dark",
    themes: [
      {
        "portfolio-light": {
          "primary":   "#4F46E5", // indigo-600
          "secondary": "#06B6D4", // cyan-500
          "accent":    "#F97316", // orange-500
          "neutral":   "#0F172A", // slate-900 (metin vurguları)
          "base-100":  "#FFFFFF", // ana yüzey
          "base-200":  "#F6F7FB", // hafif yüzey
          "base-300":  "#E8ECF3", // sınır/ayraç
          "info":      "#2563EB",
          "success":   "#16A34A",
          "warning":   "#F59E0B",
          "error":     "#DC2626"
        }
      },
      {
        "portfolio-dark": {
          "primary":   "#8B95F7", // indigo-400
          "secondary": "#22D3EE", // cyan-400
          "accent":    "#FB923C", // orange-400
          "neutral":   "#E5E7EB", // açık metin
          "base-100":  "#0B1020", // ana yüzey (derin lacivert-gri)
          "base-200":  "#10172A", // ikinci yüzey
          "base-300":  "#1F2A3C", // sınır/ayraç
          "info":      "#60A5FA",
          "success":   "#22C55E",
          "warning":   "#FBBF24",
          "error":     "#F87171"
        }
      }
    ],
  },
}