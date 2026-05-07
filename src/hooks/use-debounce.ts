import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // ✅ Set timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // ✅ Cleanup timeout on change
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  // ✅ Return debounced value
  return debouncedValue
}
