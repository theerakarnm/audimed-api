import { InteractiveElement, useInteractiveLoading } from "~/hooks/use-interactive-loading"

export function LoadingManager({
  interactiveElements,
}: {
  interactiveElements: InteractiveElement[]
}) {
  const { loading, cancel, registerResult } = useInteractiveLoading()

  if (!loading.isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg space-y-4 w-80">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Loading... {loading.stage}</p>
          <button className="text-sm text-red-500" onClick={cancel}>
            Cancel
          </button>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="bg-blue-500 h-full rounded transition-all"
            style={{ width: `${loading.progress ?? 0}%` }}
          />
        </div>
        {interactiveElements.map((el, i) => {
          const Component = el.component
          return (
            <Component
              key={i}
              onComplete={(r) => {
                el.onComplete?.(r)
                registerResult(el.type + i, r)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
