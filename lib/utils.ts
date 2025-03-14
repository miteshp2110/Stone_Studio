import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCartSet() {
  if (typeof window === "undefined") {
    return new Set<number>();
  }
  const cartSet: Set<number> = new Set(JSON.parse(localStorage.getItem("cartSet") || "[]"));
  return cartSet;
}


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getImageUrl(imageUrls: string, index = 0): string {
  // console.log("imageUrls", imageUrls[0])
  try {
    // const urls = JSON.parse(imageUrls)
    return imageUrls[index] || "/placeholder.svg"
  } catch (error) {
    return "/placeholder.svg"
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

