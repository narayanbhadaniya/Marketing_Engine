/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C3AFF",
        accent: "#FF5C8D",
        dark: "#0D0D1A",
        surface: "#1A1A2E",
        card: "#16213E",
      },
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body: ["'Satoshi'", "sans-serif"],
      }
    },
  },
  plugins: [],
}
