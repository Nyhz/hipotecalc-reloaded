// Hook para Google Analytics 4 with CookieYes consent
export const useGoogleAnalytics = () => {
  const parseCookieYesConsent = () => {
    if (typeof window === "undefined") return null

    const cookies = document.cookie.split(";")
    let consentCookie = null

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith("cookieyes-consent=")) {
        consentCookie = cookie.substring("cookieyes-consent=".length)
        break
      }
    }

    if (!consentCookie) return null

    const consentData: Record<string, string> = {}
    const parts = consentCookie.split(",")

    for (let j = 0; j < parts.length; j++) {
      const keyValue = parts[j].split(":")
      if (keyValue.length === 2) {
        consentData[keyValue[0]] = keyValue[1]
      }
    }

    return consentData
  }

  const hasAnalyticsConsent = () => {
    const consent = parseCookieYesConsent()
    return consent && consent.analytics === "yes"
  }

  const isGtagLoaded = () => {
    return typeof window !== "undefined" && (window as any).gtag
  }

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (isGtagLoaded() && hasAnalyticsConsent()) {
      ;(window as any).gtag("event", eventName, {
        event_category: "engagement",
        event_label: "user_interaction",
        ...parameters,
      })
    }
  }

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (isGtagLoaded() && hasAnalyticsConsent()) {
      ;(window as any).gtag("config", "G-RCYZ4N1WPT", {
        page_path: pagePath,
        page_title: pageTitle,
        analytics_storage: "granted",
      })
    }
  }

  const trackCalculatorUsage = (calculatorType: string, action: string) => {
    if (hasAnalyticsConsent()) {
      trackEvent("calculator_usage", {
        calculator_type: calculatorType,
        action: action,
        event_category: "tools",
      })
    }
  }

  const trackContactAttempt = (source: string) => {
    if (hasAnalyticsConsent()) {
      trackEvent("contact_attempt", {
        contact_source: source,
        event_category: "conversion",
        value: 1,
      })
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackCalculatorUsage,
    trackContactAttempt,
    hasAnalyticsConsent,
  }
}
