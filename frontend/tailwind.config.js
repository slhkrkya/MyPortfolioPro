// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "portfolio-dark",
    logs: false,
    themes: [
      // 🌞 Cartoon Day (LIGHT)
      {
        "portfolio-light": {
          "primary": "247 100% 67%",
          "primary-content": "0 0% 100%",

          "secondary": "195 100% 50%",
          "secondary-content": "195 85% 12%",

          "accent": "24 100% 62%",
          "accent-content": "215 28% 24%",

          "neutral": "222 47% 11%",
          "neutral-content": "220 60% 96%",

          "base-100": "0 0% 100%",
          "base-200": "220 60% 97%",
          "base-300": "226 40% 90%",
          "base-content": "222 47% 11%",

          "info": "217 91% 60%",
          "success": "142 71% 45%",
          "warning": "38 92% 50%",
          "error": "0 72% 51%"
        }
      },

      // 🌙 Cartoon Night (DARK)
      {
        "portfolio-dark": {
          "primary": "248 100% 80%",
          "primary-content": "246 30% 20%",

          "secondary": "192 100% 70%",
          "secondary-content": "196 80% 10%",

          "accent": "24 100% 74%",
          "accent-content": "215 28% 24%",

          "neutral": "220 14% 90%",
          "neutral-content": "222 60% 9%",

          "base-100": "222 60% 9%",
          "base-200": "222 47% 13%",
          "base-300": "214 28% 17%",
          "base-content": "220 100% 95%",

          "info": "217 96% 76%",
          "success": "152 60% 50%",
          "warning": "43 96% 56%",
          "error": "0 88% 70%"
        }
      }
    ],
  },
}
