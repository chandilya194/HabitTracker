"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useTaskStore } from "@/lib/task-store"
import { CalendarStrip } from "@/components/calendar-strip"
import { TaskCard } from "@/components/task-card"
import { BottomNav } from "@/components/bottom-nav"
import { AddTaskModal } from "@/components/add-task-modal"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"

export default function TasksPage() {
  const router = useRouter()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const { 
    selectedDate, 
    setSelectedDate, 
    getTasksForDate, 
    completeTask, 
    deleteTask,
    user,
    loading,
    signOut
  } = useTaskStore()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-[#ff5f40] font-semibold text-lg">Loading...</div>
      </div>
    )
  }
  
  const tasks = getTasksForDate(selectedDate)
  
  const formatSelectedDate = () => {
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    
    if (isToday) {
      return "Today"
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (selectedDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (selectedDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    }
    
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }
  
  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsAddModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingTask(null)
  }
  
  // Sort tasks: incomplete first, then by time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return a.time.localeCompare(b.time)
  })
  
  const incompleteTasks = sortedTasks.filter(t => !t.completed)
  const completedTasks = sortedTasks.filter(t => t.completed)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 md:pl-20 lg:pl-64">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatSelectedDate()}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-full px-4 h-9"
          >
            Sign Out
          </Button>
        </div>
        
        {/* Calendar Strip */}
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto pb-3">
          <CalendarStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </header>
      
      {/* Task List */}
      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 py-6">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No tasks for this day
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Tap the + button to add a new task or habit to track
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {incompleteTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  To Do ({incompleteTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {incompleteTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Completed ({completedTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add task</span>
      </Button>
      
      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Add/Edit Task Modal */}
      <AddTaskModal
        open={isAddModalOpen}
        onOpenChange={handleCloseModal}
        editingTask={editingTask}
      />
    </div>
  )
}
