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
          primary: "rgb(45, 55, 72)",
          "primary-content": "#ffffff",
          secondary: "rgb(251, 250, 249)",
          "secondary-content": "rgb(45, 55, 72)",
          accent: "#9f95f0",
          "accent-content": "#ffffff",
          neutral: "#d4d4d4",
          "neutral-content": "rgb(45, 55, 72)",
          "base-100": "rgb(251, 250, 249)",
          "base-200": "rgb(245, 243, 239)",
          "base-300": "#EBE8E0", // bg color
          "base-content": "rgb(45, 55, 72)",
          info: "#93c6ff",
          success: "#00d395",
          warning: "#fed7aa",
          error: "#f9b5a8",

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
          primary: "rgb(251, 250, 249)",
          "primary-content": "rgb(70, 77, 88)",
          secondary: "rgb(70, 77, 88)",
          "secondary-content": "rgb(229, 211, 190)",
          accent: "#9f95f0",
          "accent-content": "rgb(45, 55, 72)",
          neutral: "#525252",
          "neutral-content": "rgb(229, 211, 190)",
          "base-100": "rgb(70, 77, 88)",
          "base-200": "rgb(63, 70, 80)",
          "base-300": "rgb(56, 62, 71)", // bg color
          "base-content": "rgb(229, 211, 190)",
          info: "#93c6ff",
          success: "#25e2a4",
          warning: "#f6ba74",
          error: "#f48975",

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
        inner: "inset 0 6px 12px 4px rgba(0, 4, 8, 0.075)", // More aggressive "shadow-inner"
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        "custom-beige-start": "#e5d3be",
        "custom-beige-end": "#e6c6a0",
        "error-tint": "#ef444433",
        "warning-tint": "#f59e0b33",
        "success-tint": "#10b98133",
        "info-tint": "#06b6d433",
      },
    },
  },
};
