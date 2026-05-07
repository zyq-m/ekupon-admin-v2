import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { type DateRange } from "react-day-picker"

type PresetDate = "this-week" | "this-month" | "custom"

export function DateRangeFilter({
  onUpdate,
}: {
  onUpdate: (range: { from: string; to: string }) => void
}) {
  const [selectedPreset, setSelectedPreset] = useState<PresetDate>("this-week")
  const [date, setDate] = useState<DateRange | undefined>(() => {
    return {
      from: dayjs().startOf("week").toDate(),
      to: dayjs().endOf("week").toDate(),
    }
  })

  useEffect(() => {
    onUpdate({
      from: dayjs().startOf("week").format("YYYY-MM-DD"),
      to: dayjs().endOf("week").format("YYYY-MM-DD"),
    })
  }, [])

  const handlePresetChange = (value: PresetDate) => {
    setSelectedPreset(value)
    if (value === "this-week") {
      const newRange = {
        from: dayjs().startOf("week").toDate(),
        to: dayjs().endOf("week").toDate(),
      }
      setDate(newRange)
      onUpdate({
        from: dayjs(newRange.from).format("YYYY-MM-DD"),
        to: dayjs(newRange.to).format("YYYY-MM-DD"),
      })
    } else if (value === "this-month") {
      const newRange = {
        from: dayjs().startOf("month").toDate(),
        to: dayjs().endOf("month").toDate(),
      }
      setDate(newRange)
      onUpdate({
        from: dayjs(newRange.from).format("YYYY-MM-DD"),
        to: dayjs(newRange.to).format("YYYY-MM-DD"),
      })
    }
  }

  const handleCustomDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    setSelectedPreset("custom")
    if (newDate?.from && newDate?.to) {
      onUpdate({
        from: dayjs(newDate.from).format("YYYY-MM-DD"),
        to: dayjs(newDate.to).format("YYYY-MM-DD"),
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {selectedPreset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  `${dayjs(date.from).format("MMM DD")} - ${dayjs(date.to).format("MMM DD, YYYY")}`
                ) : (
                  dayjs(date.from).format("MMM DD, YYYY")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
