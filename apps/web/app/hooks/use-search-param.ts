import { useCallback } from "react"
import { useSearchParams } from "@remix-run/react"

export function useSearchParam(key: string, defaultValue: string): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(key) ?? defaultValue

  const setValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(key, newValue)
      setSearchParams(params)
    },
    [key, searchParams, setSearchParams]
  )

  return [value, setValue]
}
