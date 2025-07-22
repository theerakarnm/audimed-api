import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe localStorage utilities for SSR
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  
  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  
  clear: (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}
