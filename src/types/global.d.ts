// Global type declarations for better TypeScript support

interface PageTransitionEvent extends Event {
  readonly persisted: boolean
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export {}
