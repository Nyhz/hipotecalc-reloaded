import { referalLink } from "../constants/referal"

interface ContactButtonProps {
  variant?: "desktop" | "mobile"
  className?: string
}

export default function ContactButton({
  variant = "desktop",
  className = "",
}: ContactButtonProps) {
  const baseClasses =
    "bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 font-medium border border-blue-200/50 hover:border-blue-300/70 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"

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
    >
      {text[variant]}
    </a>
  )
}
