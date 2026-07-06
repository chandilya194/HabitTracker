"use client"

import { useState } from "react"
import { Check, Pencil, Trash2, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Task } from "@/lib/types"
import { RatingModal } from "./rating-modal"

interface TaskCardProps {
  task: Task
  onComplete: (id: string, rating?: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isMissed?: boolean
}

export function TaskCard({ task, onComplete, onEdit, onDelete, isMissed }: TaskCardProps) {
  const [showRating, setShowRating] = useState(false)

  const getTaskStyles = () => {
    switch (task.type) {
      case "onetime":
        return "bg-task-onetime/50 border-task-onetime"
      case "routine-single":
        return "bg-task-routine/50 border-task-routine"
      case "routine-satisfaction":
        return "bg-task-satisfaction/50 border-task-satisfaction"
      default:
        return "bg-card border-border"
    }
  }

  const getTypeLabel = () => {
    switch (task.type) {
      case "onetime":
        return "One-time"
      case "routine-single":
        return "Routine"
      case "routine-satisfaction":
        return "Routine"
      default:
        return ""
    }
  }

  const getTypeIcon = () => {
    if (task.type === "routine-single") {
      return <Star className="h-3 w-3 fill-current" />
    }
    if (task.type === "routine-satisfaction") {
      return (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-current" />
          ))}
        </div>
      )
    }
    return null
  }

  const handleCompleteClick = () => {
    if (task.type === "routine-satisfaction" && !task.completed) {
      setShowRating(true)
    } else {
      onComplete(task.id)
    }
  }

  const handleRatingSubmit = (rating: number) => {
    onComplete(task.id, rating)
    setShowRating(false)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <>
      <Card className={cn(
        "border-l-4 transition-all py-0",
        isMissed ? "bg-red-500/10 border-red-500/60 dark:bg-red-950/20 dark:border-red-900/60 text-red-900 dark:text-red-200" : getTaskStyles(),
        task.completed && "opacity-60",
        isMissed && "opacity-65"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                  task.type === "onetime" && "bg-task-onetime text-task-onetime-foreground",
                  task.type === "routine-single" && "bg-task-routine text-task-routine-foreground",
                  task.type === "routine-satisfaction" && "bg-task-satisfaction text-task-satisfaction-foreground"
                )}>
                  {getTypeLabel()}
                  {getTypeIcon()}
                </span>
              </div>

              <h3 className={cn(
                "font-semibold text-foreground",
                task.completed && "line-through"
              )}>
                {task.name}
              </h3>

              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(task.time)}</span>
                </div>

                {task.completed && task.satisfactionRating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < task.satisfactionRating!
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center gap-1">
              {!task.completed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCompleteClick}
                  className="h-8 w-8 rounded-full bg-success/10 text-success hover:bg-success hover:text-success-foreground"
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Complete task</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8 rounded-full hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RatingModal
        open={showRating}
        onOpenChange={setShowRating}
        onSubmit={handleRatingSubmit}
        taskName={task.name}
      />
    </>
  )
}
