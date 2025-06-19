import { useSearchParam } from "./use-search-param"

export function useActiveSection() {
  return useSearchParam("activeSection", "dashboard")
}
