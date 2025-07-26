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
  const { trackPageView } = useGoogleAnalytics()

  useEffect(() => {
    // Track page view when component mounts
    trackPageView(pagePath, pageTitle)
  }, [pagePath, pageTitle, trackPageView])

  return null // This component doesn't render anything
}
