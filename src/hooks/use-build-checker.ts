import { useEffect, useRef } from "react"

export function useBuildChecker() {
  const scriptSrcRef = useRef<string | null>(null)

  useEffect(() => {
    const script = document.querySelector<HTMLScriptElement>(
      'script[type="module"][src*="/assets/"]'
    )
    if (script?.src) {
      scriptSrcRef.current = script.src
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${window.location.origin}/ekupon-admin/index.html?t=${Date.now()}`,
          { cache: "no-store" }
        )
        const html = await res.text()
        const match = html.match(
          /<script type="module"[^>]*src="([^"]+)"/
        )
        if (match && scriptSrcRef.current) {
          const newSrc = match[1].startsWith("http")
            ? match[1]
            : `${window.location.origin}${match[1]}`
          if (newSrc !== scriptSrcRef.current) {
            scriptSrcRef.current = newSrc
            window.dispatchEvent(new CustomEvent("new-build"))
          }
        }
      } catch {
        // ignore fetch errors
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [])
}
