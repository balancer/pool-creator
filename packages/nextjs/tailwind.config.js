/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#a78bfa",
          "primary-content": "#ffffff",
          secondary: "rgb(251, 250, 249)",
          "secondary-content": "rgb(45, 55, 72)",
          accent: "#a78bfa",
          "accent-content": "#ffffff",
          neutral: "#d4d4d4",
          "neutral-content": "rgb(45, 55, 72)",
          "base-100": "rgb(251, 250, 249)",
          "base-200": "rgb(245, 243, 239)",
          "base-300": "#EBE8E0", // bg color
          "base-content": "rgb(45, 55, 72)",
          info: "#93BBFB",
          success: "#00a474",
          warning: "#fdba74",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#ffffffff",
          "primary-content": "#0f172a",
          secondary: "rgb(70, 77, 88)",
          "secondary-content": "rgb(229, 211, 190)",
          accent: "#a78bfa",
          "accent-content": "#ffffff",
          neutral: "rgb(229, 211, 190)",
          "neutral-content": "rgb(70, 77, 88)",
          "base-100": "rgb(70, 77, 88)",
          "base-200": "rgb(63, 70, 80)",
          "base-300": "rgb(56, 62, 71)", // bg color
          "base-content": "rgb(229, 211, 190)",
          info: "#93BBFB",
          success: "#00a474",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", "sans-serif"],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
