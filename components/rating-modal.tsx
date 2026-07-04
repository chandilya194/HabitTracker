"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RatingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: number) => void
  taskName: string
}

export function RatingModal({ open, onOpenChange, onSubmit, taskName }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating)
      setRating(0)
    }
  }
  
  const labels = [
    "",
    "Not satisfied",
    "Slightly satisfied",
    "Moderately satisfied",
    "Very satisfied",
    "Extremely satisfied",
  ]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Satisfaction</DialogTitle>
          <DialogDescription>
            How satisfied are you with completing <span className="font-medium text-foreground">{taskName}</span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    (hoveredRating ? value <= hoveredRating : value <= rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground h-5">
            {labels[hoveredRating || rating]}
          </p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0}
            className="bg-primary text-primary-foreground"
          >
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
