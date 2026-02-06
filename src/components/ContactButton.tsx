import { referalLink } from "../constants/referal"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"
import { useTranslations } from "../hooks/useTranslations"

interface ContactButtonProps {
  variant?: "desktop" | "mobile"
  className?: string
}

export default function ContactButton({
  variant = "desktop",
  className = "",
}: ContactButtonProps) {
  const { trackContactAttempt } = useGoogleAnalytics()
  const { t } = useTranslations()

  const handleClick = () => {
    // Track contact attempt
    trackContactAttempt(`navbar_${variant}`)
  }
  const baseClasses =
    "btn btn-primary cursor-pointer"

  const variantClasses = {
    desktop: "px-4 py-2 text-sm",
    mobile: "px-3 py-1.5 text-xs",
  }

  const text = {
    desktop: t("common.contact"),
    mobile: t("common.contactMobile"),
  }

  return (
    <a
      href={referalLink}
      target='_blank'
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
    >
      <div className='relative'>
        <div className='w-2.5 h-2.5 bg-green-400 rounded-full'></div>
        <div className='absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75'></div>
      </div>
      {text[variant]}
    </a>
  )
}
