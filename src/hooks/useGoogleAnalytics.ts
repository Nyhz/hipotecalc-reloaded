// Hook para Google Analytics 4
export const useGoogleAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", eventName, {
        event_category: "engagement",
        event_label: "user_interaction",
        ...parameters,
      })
    }
  }

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("config", "G-RCYZ4N1WPT", {
        page_path: pagePath,
        page_title: pageTitle,
      })
    }
  }

  const trackCalculatorUsage = (calculatorType: string, action: string) => {
    trackEvent("calculator_usage", {
      calculator_type: calculatorType,
      action: action,
      event_category: "tools",
    })
  }

  const trackContactAttempt = (source: string) => {
    trackEvent("contact_attempt", {
      contact_source: source,
      event_category: "conversion",
      value: 1,
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackCalculatorUsage,
    trackContactAttempt,
  }
}
