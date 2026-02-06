import type { Language } from "./i18n"

export function formatNumberByLang(value: number, lang: Language): string {
  const locale = lang === "en" ? "en-US" : "es-ES"

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
