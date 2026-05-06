import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a numeric value or string to RM currency format.
 * Example: 1250.5 -> "RM 1,250.50"
 */
export const formatRM = (value: string | number): string => {
  const number = typeof value === "string" ? parseFloat(value) : value

  // Check if it's a valid number
  if (isNaN(number)) return "RM 0.00"

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  })
    .format(number)
    .replace("MYR", "RM")
    .trim()
}

export function formatDate(date: string | Date) {
  return dayjs(date).format("DD/MM/YYYY")
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US").format(number)
}
