// Global type declarations for better TypeScript support

interface PageTransitionEvent extends Event {
  readonly persisted: boolean
}

interface CookieYes {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    cookieyes?: CookieYes
    dataLayer?: any[]
  }
}

export {}
