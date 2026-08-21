import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Compatibility shim for the current App.jsx: CAR_COUNTRIES is referenced by
// the car marketplace views but is not declared in the source file. Inject it
// at Vite transform time so the production build cannot crash at startup.
const karajiCarCountries = [
  { code: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "ksa", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "karaji-car-countries-shim",
      transform(code, id) {
        if (id.replaceAll("\\", "/").endsWith("/src/App.jsx") && !code.includes("const CAR_COUNTRIES")) {
          return {
            code: `const CAR_COUNTRIES = ${JSON.stringify(karajiCarCountries)};\n${code}`,
            map: null,
          };
        }
        return null;
      },
    },
  ],
});
