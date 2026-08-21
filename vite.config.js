import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const karajiCarCountries = [
  { code: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "ksa", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "karaji-compatibility-shim",
      transform(code, id) {
        const normalized = id.replaceAll("\\", "/");
        if (normalized.endsWith("/src/App.jsx")) {
          let next = code;
          if (!next.includes("const CAR_COUNTRIES")) {
            next = `const CAR_COUNTRIES = ${JSON.stringify(karajiCarCountries)};\n${next}`;
          }
          if (!next.includes('from "./components/CarForm"')) {
            next = `import CarForm from "./components/CarForm.jsx";\n${next}`;
          }
          return { code: next, map: null };
        }
        return null;
      },
    },
  ],
});
