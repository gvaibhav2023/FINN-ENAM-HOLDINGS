/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D10",
        surface: "#14171C",
        "surface-light": "#1C2128",
        border: "#23272F",
        text: "#E8EAED",
        muted: "#8A9099",
        accent: "#2DD4BF",
        gain: "#22C55E",
        loss: "#EF4444",
        amber: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

