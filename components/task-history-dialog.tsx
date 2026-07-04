"use client"

import { useMemo } from "react"
import { Star, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTaskStore } from "@/lib/task-store"
import type { Task } from "@/lib/types"

interface TaskHistoryDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskHistoryDialog({ task, open, onOpenChange }: TaskHistoryDialogProps) {
  const { getTaskWeeklyHistory } = useTaskStore()
  
  const history = useMemo(() => {
    if (!task) return []
    return getTaskWeeklyHistory(task.id, 3) // Get last 3 months
  }, [task, getTaskWeeklyHistory])
  
  if (!task) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {task.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Weekly star history (Mon-Fri, max 25 stars/week)
          </p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No history available yet
                </p>
              </div>
            ) : (
              history.map((month) => (
                <div key={month.month} className="space-y-3">
                  {/* Month Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {month.monthName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{month.totalEarned}</span>
                      <span>/ {month.totalPossible}</span>
                    </div>
                  </div>
                  
                  {/* Weekly Bars */}
                  <div className="space-y-2">
                    {month.weeks.map((week) => (
                      <WeekBar key={week.weekStart} week={week} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface WeekBarProps {
  week: {
    weekNumber: number
    weekStart: string
    weekEnd: string
    earnedStars: number
    maxStars: number
    dailyRatings: { date: string; rating: number }[]
  }
}

function WeekBar({ week }: WeekBarProps) {
  const percentage = (week.earnedStars / week.maxStars) * 100
  
  // Format date range
  const startDate = new Date(week.weekStart)
  const endDate = new Date(week.weekEnd)
  const dateRange = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  
  // Get color based on performance
  const getBarColor = () => {
    if (percentage >= 80) return "bg-success"
    if (percentage >= 60) return "bg-amber-400"
    if (percentage >= 40) return "bg-amber-500"
    return "bg-muted-foreground/30"
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">
          Week {week.weekNumber} ({dateRange})
        </span>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-foreground">
            {week.earnedStars}
          </span>
          <span className="text-xs text-muted-foreground">/ 25</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${getBarColor()} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
