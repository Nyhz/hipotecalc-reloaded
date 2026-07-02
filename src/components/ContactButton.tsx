import { referalLink } from "../constants/referal"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"
import { useTranslations } from "../hooks/useTranslations"

interface ContactButtonProps {
  variant?: "desktop" | "mobile" | "receipt"
  labelKey?: string
  className?: string
  lang?: "es" | "en"
}

export default function ContactButton({
  variant = "desktop",
  labelKey,
  className = "",
  lang,
}: ContactButtonProps) {
  const { trackContactAttempt } = useGoogleAnalytics()
  const { t } = useTranslations(lang)

  const variantClasses = {
    desktop: "px-5 py-2.5 text-sm",
    mobile: "px-3 py-2 text-xs",
    receipt: "w-full px-5 py-3.5 text-sm",
  }

  const key = labelKey ?? (variant === "mobile" ? "common.contactMobile" : "common.contact")

  return (
    <a
      href={referalLink}
      target="_blank"
      className={`cta-broker ${variantClasses[variant]} ${className}`}
      onClick={() => trackContactAttempt(`navbar_${variant}`)}
    >
      <span className="cta-dot"></span>
      {t(key)}
    </a>
  )
}
