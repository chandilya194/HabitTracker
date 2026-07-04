"use client"

import { create } from "zustand"
import type { Task, TaskCompletion, WeeklyStars, MonthlyHistory } from "./types"
import { db, auth } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"

interface TaskStore {
  tasks: Task[]
  completions: TaskCompletion[]
  selectedDate: Date
  loading: boolean
  user: any | null
  setSelectedDate: (date: Date) => void
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string, satisfactionRating?: number) => void
  getTasksForDate: (date: Date) => Task[]
  getTaskWeeklyHistory: (taskId: string, monthsBack?: number) => MonthlyHistory[]
  signOut: () => Promise<void>
}

// Helper functions for date calculations
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getFriday(date: Date): Date {
  const monday = getMonday(date)
  monday.setDate(monday.getDate() + 4)
  return monday
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return weekNo
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

// Helper to remove undefined fields from an object for Firestore
function cleanUndefinedFields(obj: any): any {
  const clean: any = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key]
    }
  })
  return clean
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  completions: [],
  selectedDate: new Date(),
  loading: db ? true : false,
  user: null,
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  addTask: async (taskData) => {
    const id = crypto.randomUUID()
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
    }
    
    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        await setDoc(doc(db, "users", uid, "tasks", id), cleanUndefinedFields(newTask))
      } catch (error) {
        console.error("Error adding task to Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({ tasks: [...state.tasks, newTask] }))
    }
  },
  
  updateTask: async (id, updates) => {
    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        await updateDoc(doc(db, "users", uid, "tasks", id), cleanUndefinedFields(updates))
      } catch (error) {
        console.error("Error updating task in Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      }))
    }
  },
  
  deleteTask: async (id) => {
    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        const batch = writeBatch(db)
        
        // Delete task doc
        const taskDocRef = doc(db, "users", uid, "tasks", id)
        batch.delete(taskDocRef)

        // Delete associated completions docs
        const completionsQuery = query(
          collection(db, "users", uid, "completions"), 
          where("taskId", "==", id)
        )
        const completionsSnapshot = await getDocs(completionsQuery)
        completionsSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref)
        })

        await batch.commit()
      } catch (error) {
        console.error("Error deleting task from Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        completions: state.completions.filter((c) => c.taskId !== id),
      }))
    }
  },
  
  completeTask: async (id, satisfactionRating) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    
    const updates: Partial<Task> = { completed: true }
    if (satisfactionRating !== undefined) {
      updates.satisfactionRating = satisfactionRating
    }
    
    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        const batch = writeBatch(db)
        
        // 1. Update task in tasks collection (completed status & rating)
        const taskDocRef = doc(db, "users", uid, "tasks", id)
        batch.update(taskDocRef, updates)

        // 2. Add or update completion record in completions collection
        const dateStr = get().selectedDate.toISOString().split("T")[0]
        const completionId = `${id}_${dateStr}`
        const completionDocRef = doc(db, "users", uid, "completions", completionId)

        const completionData: TaskCompletion = {
          taskId: id,
          date: dateStr,
          completed: true,
        }
        if (satisfactionRating !== undefined) {
          completionData.satisfactionRating = satisfactionRating
        }

        batch.set(completionDocRef, completionData)
        await batch.commit()
      } catch (error) {
        console.error("Error completing task in Firestore:", error)
      }
    } else {
      // Local fallback
      const dateStr = get().selectedDate.toISOString().split("T")[0]
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
        completions: [
          ...state.completions,
          {
            taskId: id,
            date: dateStr,
            completed: true,
            satisfactionRating,
          },
        ],
      }))
    }
  },
  
  getTasksForDate: (date) => {
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()] as Task["customDays"] extends (infer U)[] ? U : never
    
    return get().tasks
      .filter((task) => {
        // For one-time tasks, check exact date match
        if (task.type === "onetime") {
          return task.date === dateStr
        }
        
        // For recurring tasks, check if they should appear on this day
        if (task.recurrence === "daily") {
          return task.date <= dateStr
        }
        
        if (task.recurrence === "custom" && task.customDays) {
          return task.date <= dateStr && task.customDays.includes(dayOfWeek as never)
        }
        
        return false
      })
      .map((task) => {
        // For routine tasks, resolve completed status and satisfactionRating for this specific date
        if (task.type === "onetime") {
          return task
        }
        const completion = get().completions.find(
          (c) => c.taskId === task.id && c.date === dateStr
        )
        return {
          ...task,
          completed: completion ? completion.completed : false,
          satisfactionRating: completion ? completion.satisfactionRating : undefined,
        }
      })
  },
  
  getTaskWeeklyHistory: (taskId, monthsBack = 3) => {
    const { completions } = get()
    const taskCompletions = completions.filter(c => c.taskId === taskId)
    
    const today = new Date()
    const startDate = new Date(today)
    startDate.setMonth(startDate.getMonth() - monthsBack)
    startDate.setDate(1) // Start from beginning of the month
    
    const monthlyHistoryMap = new Map<string, MonthlyHistory>()
    
    // Generate weeks from startDate to today
    let currentDate = getMonday(startDate)
    
    while (currentDate <= today) {
      const monday = new Date(currentDate)
      const friday = getFriday(currentDate)
      const weekNum = getWeekNumber(monday)
      const monthKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}`
      
      // Get completions for this week (Mon-Fri)
      const dailyRatings: { date: string; rating: number }[] = []
      let earnedStars = 0
      
      for (let d = new Date(monday); d <= friday; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]
        const completion = taskCompletions.find(c => c.date === dateStr)
        const rating = completion?.satisfactionRating || 0
        dailyRatings.push({ date: dateStr, rating })
        earnedStars += rating
      }
      
      const weekData: WeeklyStars = {
        weekNumber: weekNum,
        weekStart: monday.toISOString().split("T")[0],
        weekEnd: friday.toISOString().split("T")[0],
        earnedStars,
        maxStars: 25,
        dailyRatings,
      }
      
      if (!monthlyHistoryMap.has(monthKey)) {
        monthlyHistoryMap.set(monthKey, {
          month: monthKey,
          monthName: formatMonthYear(monday),
          weeks: [],
          totalEarned: 0,
          totalPossible: 0,
        })
      }
      
      const monthHistory = monthlyHistoryMap.get(monthKey)!
      monthHistory.weeks.push(weekData)
      monthHistory.totalEarned += earnedStars
      monthHistory.totalPossible += 25
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    // Convert map to array and sort by month (newest first)
    return Array.from(monthlyHistoryMap.values()).sort((a, b) => b.month.localeCompare(a.month))
  },
  signOut: async () => {
    if (auth) {
      await auth.signOut()
    }
  },
}))

// Subscriptions cleanup variables
let unsubscribeTasks: (() => void) | null = null
let unsubscribeCompletions: (() => void) | null = null

// Start real-time Firestore synchronization if db and auth are available in the browser
if (db && auth && typeof window !== "undefined") {
  onAuthStateChanged(auth, async (user) => {
    // Clean up any existing listeners first
    if (unsubscribeTasks) {
      unsubscribeTasks()
      unsubscribeTasks = null
    }
    if (unsubscribeCompletions) {
      unsubscribeCompletions()
      unsubscribeCompletions = null
    }

    if (user) {
      // Update the user state
      useTaskStore.setState({ user, loading: true })
      
      const uid = user.uid
      
      // 1. Listen to tasks collection under users/{uid}/tasks
      const tasksRef = collection(db, "users", uid, "tasks")
      unsubscribeTasks = onSnapshot(tasksRef, (tasksSnapshot) => {
        const dbTasks: Task[] = []
        tasksSnapshot.forEach((docSnap) => {
          dbTasks.push({ id: docSnap.id, ...docSnap.data() } as Task)
        })
        
        // 2. Listen to completions collection under users/{uid}/completions
        const completionsRef = collection(db, "users", uid, "completions")
        unsubscribeCompletions = onSnapshot(completionsRef, (completionsSnapshot) => {
          const dbCompletions: TaskCompletion[] = []
          completionsSnapshot.forEach((docSnap) => {
            dbCompletions.push(docSnap.data() as TaskCompletion)
          })
          
          // Map database tasks to include today's completion status
          const todayStr = new Date().toISOString().split("T")[0]
          const mappedTasks = dbTasks.map((task) => {
            const todayCompletion = dbCompletions.find(
              (c) => c.taskId === task.id && c.date === todayStr
            )
            return {
              ...task,
              completed: todayCompletion ? todayCompletion.completed : false,
              satisfactionRating: todayCompletion ? todayCompletion.satisfactionRating : undefined,
            }
          })
          
          // Update the Zustand store
          useTaskStore.setState({
            tasks: mappedTasks,
            completions: dbCompletions,
            loading: false,
          })
        }, (error) => {
          console.error("Error in Firestore completions subscription:", error)
          useTaskStore.setState({ loading: false })
        })
      }, (error) => {
        console.error("Error in Firestore tasks subscription:", error)
        useTaskStore.setState({ loading: false })
      })
      
    } else {
      // Not authenticated: clear user state, tasks and completions, set loading false
      useTaskStore.setState({
        user: null,
        tasks: [],
        completions: [],
        loading: false,
      })
    }
  })
}
