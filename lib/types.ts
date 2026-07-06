export type TaskType = "onetime" | "routine-single" | "routine-satisfaction"

export type RecurrenceType = "daily" | "custom"

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export interface Task {
  id: string
  name: string
  description: string
  type: TaskType
  date: string // ISO date string
  time: string // HH:mm format
  recurrence: RecurrenceType
  customDays?: DayOfWeek[]
  completed: boolean
  satisfactionRating?: number // 1-5 stars for satisfaction-based tasks
  createdAt: string
}

export interface TaskCompletion {
  taskId: string
  date: string
  completed: boolean
  satisfactionRating?: number
}

export interface WeeklyStars {
  weekNumber: number // Week of year
  weekStart: string // ISO date string for Monday
  weekEnd: string // ISO date string for Friday
  earnedStars: number // 0-25
  maxStars: number // 25
  dailyRatings: { date: string; rating: number }[] // Mon-Fri ratings
}

export interface MonthlyHistory {
  month: string // Format: "2026-04"
  monthName: string // Format: "April 2026"
  weeks: WeeklyStars[]
  totalEarned: number
  totalPossible: number
}

export interface Note {
  id: string
  title: string
  content: string
  color: string // Tailwind bg class color code
  createdAt: string
  updatedAt: string
}
