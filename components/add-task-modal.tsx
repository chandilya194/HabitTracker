"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTaskStore } from "@/lib/task-store"
import type { Task, TaskType, RecurrenceType, DayOfWeek } from "@/lib/types"

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask?: Task | null
}

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
]

export function AddTaskModal({ open, onOpenChange, editingTask }: AddTaskModalProps) {
  const { addTask, updateTask, selectedDate } = useTaskStore()
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState<TaskType>("routine-single")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("09:00")
  const [recurrence, setRecurrence] = useState<RecurrenceType>("daily")
  const [customDays, setCustomDays] = useState<DayOfWeek[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Reset form when modal opens/closes or when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name)
      setDescription(editingTask.description)
      setTaskType(editingTask.type)
      setDate(editingTask.date)
      setTime(editingTask.time)
      setRecurrence(editingTask.recurrence)
      setCustomDays(editingTask.customDays || [])
      setIsSubmitting(false)
    } else if (open) {
      // Reset to defaults for new task
      setName("")
      setDescription("")
      setTaskType("routine-single")
      setDate(selectedDate.toISOString().split("T")[0])
      setTime("09:00")
      setRecurrence("daily")
      setCustomDays([])
      setIsSubmitting(false)
    }
  }, [editingTask, open, selectedDate])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    if (!name.trim()) return
    
    setIsSubmitting(true)
    
    const taskData = {
      name: name.trim(),
      description: description.trim(),
      type: taskType,
      date,
      time,
      recurrence: taskType === "onetime" ? "daily" as RecurrenceType : recurrence,
      customDays: recurrence === "custom" ? customDays : undefined,
      completed: editingTask?.completed || false,
      satisfactionRating: editingTask?.satisfactionRating,
    }
    
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
      } else {
        await addTask(taskData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const toggleDay = (day: DayOfWeek) => {
    setCustomDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    )
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description"
              rows={2}
            />
          </div>
          
          {/* Task Type */}
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onetime">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-task-onetime" />
                    One-time Task
                  </div>
                </SelectItem>
                <SelectItem value="routine-single">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-task-routine" />
                    Routine (Single Star)
                  </div>
                </SelectItem>
                <SelectItem value="routine-satisfaction">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-task-satisfaction" />
                    Routine (Satisfaction Rating)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Recurrence (only for routine tasks) */}
          {taskType !== "onetime" && (
            <div className="space-y-3">
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Custom Days Selection */}
              {recurrence === "custom" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                        customDays.includes(day.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (editingTask ? "Save Changes" : "Add Task")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
