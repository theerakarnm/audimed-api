export interface LengthOfStayResult {
  days: number
  hours: number
  minutes: number
  totalHours: number
  displayText: string
}

export function calculateLengthOfStay(admitDate: Date, dischargeDate: Date = new Date()): LengthOfStayResult {
  const diffMs = dischargeDate.getTime() - admitDate.getTime()
  
  if (diffMs < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      displayText: "Invalid: Admit date cannot be in the future"
    }
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  let displayText = ""
  if (days > 0) {
    displayText += `${days} day${days !== 1 ? 's' : ''}`
  }
  if (hours > 0) {
    if (displayText) displayText += " "
    displayText += `${hours}:${minutes.toString().padStart(2, '0')}`
  } else if (minutes > 0 && days === 0) {
    displayText = `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  if (!displayText) {
    displayText = "0 minutes"
  }

  return {
    days,
    hours,
    minutes,
    totalHours,
    displayText
  }
}