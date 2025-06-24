import { useState } from "react"

const FACTS = [
  "Did you know? Short prompts often yield clearer results.",
  "Tip: Specify desired format to improve responses.",
  "You can ask for multiple suggestions in one query.",
]

export function AiFactsCarousel({
  onComplete,
}: {
  onComplete?: (factIndex: number) => void
}) {
  const [index, setIndex] = useState(0)

  const next = () => {
    const newIndex = (index + 1) % FACTS.length
    setIndex(newIndex)
    onComplete?.(newIndex)
  }

  return (
    <div className="space-y-2 text-center">
      <p>{FACTS[index]}</p>
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded"
        onClick={next}
      >
        Next
      </button>
    </div>
  )
}
