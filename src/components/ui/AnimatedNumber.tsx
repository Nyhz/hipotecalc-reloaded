import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export default function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
  duration = 900,
  className = "",
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const [locale, setLocale] = useState<"es-ES" | "en-US">("es-ES")
  const prev = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    setLocale(document.documentElement.lang === "en" ? "en-US" : "es-ES")
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || prev.current === value) {
      prev.current = value
      setDisplay(value)
      return
    }
    const from = prev.current
    prev.current = value
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (value - from) * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return (
    <span className={className}>
      {display.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
