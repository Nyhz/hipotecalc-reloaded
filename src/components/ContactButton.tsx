import { referalLink } from "../constants/referal"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"

interface ContactButtonProps {
  variant?: "desktop" | "mobile"
  className?: string
}

export default function ContactButton({
  variant = "desktop",
  className = "",
}: ContactButtonProps) {
  const { trackContactAttempt, trackButtonClick } = useGoogleAnalytics()

  const handleClick = () => {
    // Track contact attempt
    trackContactAttempt(`navbar_${variant}`)
    
    // Track general button click
    trackButtonClick('contact_broker', `navbar_${variant}`)
  }
  const baseClasses =
    "bg-blue-600 hover:bg-blue-700 text-white font-medium border border-blue-600 hover:border-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"

  const variantClasses = {
    desktop: "px-4 py-2 text-base",
    mobile: "px-3 py-1.5 text-sm",
  }

  const text = {
    desktop: "Contacta con nuestro broker",
    mobile: "Contactar",
  }

  return (
    <a
      href={referalLink}
      target='_blank'
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
    >
      {text[variant]}
    </a>
  )
}
