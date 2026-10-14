/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Sayyarti's palette (same values as src/theme.js), for the forms styled with Tailwind
      colors: {
        page: "#F2F5F9",
        surface: "#FFFFFF",
        line: "#C8D1DC",
        ink: "#0E1B2C",
        dim: "#4B5A6D",
        accent: "#0B4FA0",
        "on-accent": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
