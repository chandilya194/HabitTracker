"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { useTaskStore } from "@/lib/task-store"
import { BottomNav } from "@/components/bottom-nav"
import { TaskHistoryDialog } from "@/components/task-history-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts"

export default function ReportsPage() {
  const router = useRouter()
  const { tasks, completions, user, loading, signOut } = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

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

  // Calculate statistics
  const stats = useMemo(() => {
    const routineTasks = tasks.filter(t => t.type !== "onetime")
    const onetimeTasks = tasks.filter(t => t.type === "onetime")
    const singleStarTasks = tasks.filter(t => t.type === "routine-single")
    const satisfactionTasks = tasks.filter(t => t.type === "routine-satisfaction")

    const completedRoutine = routineTasks.filter(t => t.completed).length
    const completedOnetime = onetimeTasks.filter(t => t.completed).length
    const pendingOnetime = onetimeTasks.filter(t => !t.completed).length

    // Calculate average satisfaction
    const ratingsWithValue = satisfactionTasks.filter(t => t.satisfactionRating)
    const avgSatisfaction = ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ratingsWithValue.length
      : 0

    // Calculate weekly stars for each satisfaction task (Mon-Fri = 5 days, max 5 stars each = 25 total)
    const maxWeeklyStars = 25 // 5 days × 5 stars
    const satisfactionTasksWithWeeklyStars = satisfactionTasks.map(task => {
      // For now, calculate based on completions for this week (simulated)
      // In production, you'd sum up satisfaction ratings from completions for Mon-Fri
      const weeklyCompletions = completions.filter(c =>
        c.taskId === task.id &&
        c.satisfactionRating !== undefined
      )
      const earnedStars = weeklyCompletions.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0)
      // If no completions in store, use current task rating as today's contribution
      const totalEarned = earnedStars > 0 ? earnedStars : (task.satisfactionRating || 0)
      return {
        ...task,
        weeklyEarnedStars: Math.min(totalEarned, maxWeeklyStars),
        maxWeeklyStars,
      }
    })

    return {
      routineTotal: routineTasks.length,
      completedRoutine,
      onetimeTotal: onetimeTasks.length,
      completedOnetime,
      pendingOnetime,
      singleStarTasks,
      satisfactionTasks: satisfactionTasksWithWeeklyStars,
      avgSatisfaction,
      maxWeeklyStars,
      completionRate: routineTasks.length > 0
        ? Math.round((completedRoutine / routineTasks.length) * 100)
        : 0,
    }
  }, [tasks, completions])

  // Weekly performance data
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    // Deterministic mock data to prevent hydration mismatch
    const mockCompleted = [4, 3, 5, 4, 5, 2, 3]
    const mockTotal = [5, 5, 5, 5, 5, 3, 4]
    return days.map((day, i) => {
      const completed = mockCompleted[i]
      const total = mockTotal[i]
      return {
        day,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      }
    })
  }, [])

  // Satisfaction trend data
  const satisfactionTrend = useMemo(() => {
    return [
      { day: "Mon", rating: 3.5 },
      { day: "Tue", rating: 4.0 },
      { day: "Wed", rating: 3.8 },
      { day: "Thu", rating: 4.2 },
      { day: "Fri", rating: 4.5 },
      { day: "Sat", rating: 4.0 },
      { day: "Sun", rating: 4.3 },
    ]
  }, [])
  //vdisyvsyivyvs
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 md:pl-20 lg:pl-64">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your progress and performance
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
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.completionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.avgSatisfaction.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden md:block">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.routineTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Routines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden md:block">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-task-onetime/30">
                  <Clock className="h-5 w-5 text-task-onetime-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.onetimeTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">One-time Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    hide
                    domain={[0, "dataMax + 1"]}
                  />
                  <Tooltip
                    offset={15}
                    wrapperStyle={{ zIndex: 1000, marginTop: -20 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--muted))"
                    radius={[4, 4, 0, 0]}
                    name="Total"
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Task Types */}
        <Tabs defaultValue="routine" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="routine" className="flex-1">Routine Tasks</TabsTrigger>
            <TabsTrigger value="onetime" className="flex-1">One-time Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="routine" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Single Star Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 fill-task-routine text-task-routine" />
                    Single-Star Routines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.singleStarTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No single-star routines yet
                    </p>
                  ) : (
                    stats.singleStarTasks.map((task) => (
                      <div key={task.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{task.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {task.completed ? "1" : "0"} completions
                          </span>
                        </div>
                        <Progress value={task.completed ? 100 : 0} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Satisfaction-based Tasks */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <Star key={i} className="h-3 w-3 fill-task-satisfaction text-task-satisfaction" />
                      ))}
                    </div>
                    Satisfaction Routines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.satisfactionTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No satisfaction-based routines yet
                    </p>
                  ) : (
                    <>
                      {stats.satisfactionTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task)
                            setHistoryOpen(true)
                          }}
                          className="w-full text-left space-y-2 p-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground truncate mr-2">{task.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-semibold text-foreground">
                                {task.weeklyEarnedStars}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                / {task.maxWeeklyStars}
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={(task.weeklyEarnedStars / task.maxWeeklyStars) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>Weekly stars (Mon-Fri)</span>
                            <span className="text-primary">View history</span>
                          </p>
                        </button>
                      ))}

                      {/* Satisfaction Trend Chart */}
                      <div className="h-[150px] mt-6">
                        <p className="text-xs text-muted-foreground mb-2">Weekly Trend</p>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={satisfactionTrend}>
                            <XAxis
                              dataKey="day"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <YAxis
                              domain={[0, 5]}
                              hide
                            />
                            <Tooltip
                              offset={15}
                              wrapperStyle={{ zIndex: 1000, marginTop: 0 }}
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "hsl(var(--foreground))",
                              }}
                              itemStyle={{ color: "hsl(var(--foreground))" }}
                              labelStyle={{ color: "hsl(var(--foreground))" }}
                              formatter={(value: number) => [`${value.toFixed(1)} stars`, "Rating"]}
                            />
                            <Line
                              type="monotone"
                              dataKey="rating"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="onetime" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-task-onetime" />
                  One-time Tasks Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <p className="text-3xl font-bold text-success">
                      {stats.completedOnetime}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-task-onetime/30">
                    <p className="text-3xl font-bold text-task-onetime-foreground">
                      {stats.pendingOnetime}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Pending</p>
                  </div>
                </div>

                {stats.onetimeTotal > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-muted-foreground">Recent One-time Tasks</p>
                    {tasks
                      .filter(t => t.type === "onetime")
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${task.completed ? "bg-success" : "bg-task-onetime"
                              }`} />
                            <span className="text-sm text-foreground">{task.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.completed ? "Done" : "Pending"}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {stats.onetimeTotal === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No one-time tasks yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Task History Dialog */}
      <TaskHistoryDialog
        task={selectedTask}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  )
}
