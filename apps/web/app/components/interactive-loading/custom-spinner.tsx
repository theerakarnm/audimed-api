import { useState } from "react"

export function CustomSpinner({
  onComplete,
}: {
  onComplete?: (color: string) => void
}) {
  const [color, setColor] = useState("#3b82f6")

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setColor(value)
    onComplete?.(value)
  }

  return (
    <div className="space-y-2 text-center">
      <div
        className="w-8 h-8 mx-auto rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: `${color}` }}
      />
      <input type="color" value={color} onChange={change} />
    </div>
  )
}
