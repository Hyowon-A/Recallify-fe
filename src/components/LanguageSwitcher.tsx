import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const changeLang = (lng: "en" | "ko") => i18n.changeLanguage(lng);

  return (
    <div className="inline-flex gap-2 items-center">
      <button
        onClick={() => changeLang("en")}
        className={`px-2 py-1 rounded ${i18n.resolvedLanguage === "en" ? "font-bold underline" : ""}`}
        aria-pressed={i18n.resolvedLanguage === "en"}
      >
        {t("lang.en")}
      </button>
      <span>·</span>
      <button
        onClick={() => changeLang("ko")}
        className={`px-2 py-1 rounded ${i18n.resolvedLanguage === "ko" ? "font-bold underline" : ""}`}
        aria-pressed={i18n.resolvedLanguage === "ko"}
      >
        {t("lang.ko")}
      </button>
    </div>
  );
}
