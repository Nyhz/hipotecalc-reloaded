import { referalLink } from "../constants/referal"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"
import { useTranslations } from "../hooks/useTranslations"

interface ContactButtonProps {
  variant?: "desktop" | "mobile" | "receipt"
  labelKey?: string
  className?: string
  lang?: "es" | "en"
  source?: string
}

export default function ContactButton({
  variant = "desktop",
  labelKey,
  className = "",
  lang,
  source,
}: ContactButtonProps) {
  const { trackContactAttempt } = useGoogleAnalytics()
  const { t } = useTranslations(lang)

  const variantClasses = {
    desktop: "px-5 py-2.5 text-sm whitespace-nowrap",
    mobile: "px-3 py-2 text-xs whitespace-nowrap",
    receipt: "w-full px-5 py-3.5 text-sm",
  }

  const key = labelKey ?? (variant === "mobile" ? "common.contactMobile" : "common.contact")

  return (
    <a
      href={referalLink}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`cta-broker ${variantClasses[variant]} ${className}`}
      onClick={() => trackContactAttempt(source ?? `navbar_${variant}`)}
    >
      <span className="cta-dot"></span>
      {t(key)}
    </a>
  )
}
