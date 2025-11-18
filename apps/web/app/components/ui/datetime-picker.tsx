"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "~/libs/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

interface DateTimePickerProps {
    date?: Date
    onDateChange?: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    maxDate?: Date
}

export function DateTimePicker({
    date,
    onDateChange,
    placeholder = "Pick a date and time",
    disabled = false,
    maxDate = new Date(),
}: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
    const [timeValue, setTimeValue] = React.useState<string>(
        date ? format(date, "HH:mm") : "00:00"
    )

    React.useEffect(() => {
        setSelectedDate(date)
        if (date) {
            setTimeValue(format(date, "HH:mm"))
        }
    }, [date])

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) return

        // Prevent future dates
        if (newDate > maxDate) {
            return
        }

        // Combine the selected date with the current time
        const [hours, minutes] = timeValue.split(":").map(Number)
        const combinedDateTime = new Date(newDate)
        combinedDateTime.setHours(hours, minutes, 0, 0)

        // Ensure the combined datetime is not in the future
        if (combinedDateTime > maxDate) {
            combinedDateTime.setTime(maxDate.getTime())
            const newTimeValue = format(combinedDateTime, "HH:mm")
            setTimeValue(newTimeValue)
        }

        setSelectedDate(combinedDateTime)
        onDateChange?.(combinedDateTime)
    }

    const handleTimeChange = (newTime: string) => {
        setTimeValue(newTime)

        if (selectedDate) {
            const [hours, minutes] = newTime.split(":").map(Number)
            const combinedDateTime = new Date(selectedDate)
            combinedDateTime.setHours(hours, minutes, 0, 0)

            // Ensure the combined datetime is not in the future
            if (combinedDateTime > maxDate) {
                const maxTime = format(maxDate, "HH:mm")
                setTimeValue(maxTime)
                combinedDateTime.setTime(maxDate.getTime())
            }

            setSelectedDate(combinedDateTime)
            onDateChange?.(combinedDateTime)
        }
    }

    return (
        <div className="flex space-x-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > maxDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                    type="time"
                    value={timeValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-24"
                    disabled={disabled}
                />
            </div>
        </div>
    )
}