import { create } from "zustand"
import { useEffect } from "react"
import { useLocalStorage } from "~/hooks/use-local-storage"

export interface LoadingState {
  isLoading: boolean
  progress?: number
  estimatedTime?: number
  stage?: 'connecting' | 'processing' | 'finalizing'
}

export interface InteractiveElement {
  type: 'game' | 'info' | 'customization' | 'chat'
  component: React.ComponentType<{ onComplete?: (result: any) => void }>
  onComplete?: (result: any) => void
}

type Store = {
  loading: LoadingState
  interactions: Record<string, any>
  setLoading: (s: Partial<LoadingState>) => void
  start: () => void
  finish: () => void
  cancel: () => void
  registerResult: (key: string, value: any) => void
}

const useInteractiveLoadingStore = create<Store>((set) => ({
  loading: { isLoading: false },
  interactions: {},
  setLoading: (s) => set((state) => ({ loading: { ...state.loading, ...s } })),
  start: () =>
    set({
      loading: { isLoading: true, progress: 0, stage: 'connecting' },
    }),
  finish: () =>
    set({
      loading: { isLoading: false, progress: 100, stage: 'finalizing' },
    }),
  cancel: () => set({ loading: { isLoading: false } }),
  registerResult: (key, value) =>
    set((state) => ({ interactions: { ...state.interactions, [key]: value } })),
}))

export function useInteractiveLoading() {
  const [stored, setStored] = useLocalStorage<Record<string, any>>(
    'loadingInteractions',
    {}
  )
  const store = useInteractiveLoadingStore()

  useEffect(() => {
    setStored(store.interactions)
  }, [store.interactions, setStored])

  return { ...store, interactions: stored }
}
