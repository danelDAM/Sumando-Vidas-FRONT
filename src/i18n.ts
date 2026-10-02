import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import eu from "./locales/eu.json";
import ca from "./locales/ca.json";

const savedLanguage = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
const supportedLanguages = ["es", "eu", "ca"];
const initialLanguage = savedLanguage && supportedLanguages.includes(savedLanguage) ? savedLanguage : "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    eu: { translation: eu },
    ca: { translation: ca },
  },
  lng: initialLanguage,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lang", language);
  }
});

export default i18n;
