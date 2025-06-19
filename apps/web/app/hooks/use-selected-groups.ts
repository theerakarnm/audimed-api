import { useLocalStorage } from "./use-local-storage"
import { useSearchParam } from "./use-search-param"

export type SelectedGroups = { [platform: string]: string[] }

export function useSelectedGroups() {
  return useSearchParam("selectedGroups", JSON.stringify({}))
}
