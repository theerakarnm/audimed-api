import { useState, useEffect } from "react"

const WORDS = ["react", "next", "state", "hook", "async"]

export function MiniWordGame({
  onComplete,
}: {
  onComplete?: (score: number) => void
}) {
  const [current, setCurrent] = useState(WORDS[0])
  const [input, setInput] = useState("")
  const [start, setStart] = useState<number | null>(null)
  const [typed, setTyped] = useState(0)

  const reset = () => {
    setCurrent(WORDS[Math.floor(Math.random() * WORDS.length)])
    setInput("")
    setStart(Date.now())
  }

  useEffect(() => {
    reset()
  }, [])

  useEffect(() => {
    if (input === current && start) {
      const wpm = 1 / ((Date.now() - start) / 60000)
      setTyped((t) => t + 1)
      onComplete?.(wpm)
      reset()
    }
  }, [input, current, start, onComplete])

  return (
    <div className="space-y-2">
      <p>
        Type the word: <strong>{current}</strong>
      </p>
      <input
        className="border p-2 rounded w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p className="text-sm text-gray-500">Words typed: {typed}</p>
    </div>
  )
}
