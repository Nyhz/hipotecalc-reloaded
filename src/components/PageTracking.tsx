import { useEffect } from "react"
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics"

interface PageTrackingProps {
  pagePath: string
  pageTitle: string
}

export default function PageTracking({
  pagePath,
  pageTitle,
}: PageTrackingProps) {
  const { trackPageView, hasAnalyticsConsent } = useGoogleAnalytics()

  useEffect(() => {
    // Track page view when component mounts and consent is given
    if (hasAnalyticsConsent()) {
      trackPageView(pagePath, pageTitle)
    }

    // Listen for consent changes
    const handleConsentUpdate = (e: CustomEvent) => {
      const consent = e.detail
      if (consent.analytics === "yes") {
        trackPageView(pagePath, pageTitle)
      }
    }

    document.addEventListener(
      "cookieyes_consent_update",
      handleConsentUpdate as EventListener
    )

    return () => {
      document.removeEventListener(
        "cookieyes_consent_update",
        handleConsentUpdate as EventListener
      )
    }
  }, [pagePath, pageTitle, trackPageView, hasAnalyticsConsent])

  return null // This component doesn't render anything
}
