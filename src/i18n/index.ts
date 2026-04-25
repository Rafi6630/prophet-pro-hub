import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import ar from "./ar.json";
import ku from "./ku.json";

const RTL_LANGS = ["ar", "ku"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ku: { translation: ku },
    },
    // Arabic-first per Iraq positioning
    fallbackLng: "ar",
    supportedLngs: ["ar", "en", "ku"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      // If browser language isn't in our list, fall back to AR
      lookupLocalStorage: "i18nextLng",
    },
  });

// If no stored preference, force Arabic (Iraq-first default)
if (!localStorage.getItem("i18nextLng")) {
  i18n.changeLanguage("ar");
}

function applyDirection(lng: string) {
  const code = (lng || "ar").split("-")[0];
  const isRTL = RTL_LANGS.includes(code);
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = code;
  document.documentElement.setAttribute("data-lang", code);
}

i18n.on("languageChanged", applyDirection);
applyDirection(i18n.language ?? "ar");

export default i18n;
export { RTL_LANGS };
