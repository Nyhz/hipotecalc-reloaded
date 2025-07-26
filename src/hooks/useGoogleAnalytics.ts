// Hook para Google Analytics 4 with CookieYes consent
export const useGoogleAnalytics = () => {
  const hasAnalyticsConsent = () => {
    // Check if CookieYes exists and analytics consent is given
    return (
      typeof window !== "undefined" &&
      (window as any).cookieyes &&
      (window as any).cookieyes.getItem("analytics") === "yes"
    )
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
