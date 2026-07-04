"use client"

import { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarStripProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function CalendarStrip({ selectedDate, onDateSelect }: CalendarStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)
  
  // Generate 14 days centered around today
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 7 + i)
    return date
  })
  
  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
  
  const formatDate = (date: Date) => {
    return date.getDate()
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }
  
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }
  
  useEffect(() => {
    // Scroll selected date into view on mount
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [])
  
  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="h-8 w-8 rounded-full bg-card shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date, i) => (
          <button
            key={i}
            ref={isSelected(date) ? selectedRef : null}
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] md:min-w-[64px] h-[72px] md:h-[80px] rounded-xl transition-all",
              "hover:bg-accent",
              isSelected(date)
                ? "bg-primary text-primary-foreground shadow-md"
                : isToday(date)
                  ? "bg-accent text-accent-foreground ring-2 ring-primary/30"
                  : "bg-card text-card-foreground"
            )}
          >
            <span className={cn(
              "text-xs md:text-sm font-medium",
              isSelected(date) ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {formatDay(date)}
            </span>
            <span className="text-lg md:text-xl font-semibold mt-0.5">
              {formatDate(date)}
            </span>
          </button>
        ))}
      </div>
      
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="h-8 w-8 rounded-full bg-card shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      </div>
    </div>
  )
}
