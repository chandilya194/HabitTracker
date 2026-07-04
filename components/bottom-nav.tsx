"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Tasks",
    href: "/",
    icon: CheckSquare,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-6 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Desktop/Tablet Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 w-20 lg:w-64 bg-card border-r border-border flex-col">
        <div className="p-4 lg:p-6 border-b border-border">
          <h2 className="hidden lg:block text-lg font-bold text-foreground">Habit Tracker</h2>
          <div className="lg:hidden flex items-center justify-center">
            <CheckSquare className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 p-3 lg:p-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5px]")} />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
