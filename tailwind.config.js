/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Sayyarti's palette (same values as src/theme.js), for the forms styled with Tailwind
      colors: {
        asphalt: "#14171C",
        panel: "#1D2129",
        line: "#2A2F38",
        cream: "#F2ECDD",
        dim: "#B9B2A0",
        amber: "#F5B942",
      },
    },
  },
  plugins: [],
};
