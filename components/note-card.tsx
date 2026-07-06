"use client"

import { useState } from "react"
import { Pencil, Trash2, Eye, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Note } from "@/lib/types"
import { useNotesStore } from "@/lib/notes-store"
import { colorOptions } from "./add-note-modal"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const { deleteNote } = useNotesStore()
  const [isViewOpen, setIsViewOpen] = useState(false)

  const getColorClass = () => {
    const option = colorOptions.find((o) => o.id === note.color)
    return option ? option.class : "border-border"
  }

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(note.id)
    }
  }

  return (
    <>
      <Card
        className={cn(
          "group relative border-2 border-l-4 transition-all duration-300 hover:shadow-sm",
          getColorClass()
        )}
      >
        <CardContent className="p-4 flex items-center justify-between gap-3 min-h-[60px]">
          <h3 className="font-bold text-sm md:text-base leading-snug tracking-tight text-foreground truncate flex-1">
            {note.title || "Untitled Note"}
          </h3>

          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setIsViewOpen(true)
              }}
              className="h-8 w-8 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-foreground"
              title="View Note"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(note)
              }}
              className="h-8 w-8 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-foreground"
              title="Edit Note"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive/80 hover:text-destructive"
              title="Delete Note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className={cn("sm:max-w-[550px] border-l-4", getColorClass())}>
          <DialogHeader className="space-y-1.5 pb-3 border-b border-foreground/10">
            <DialogTitle className="font-bold text-xl leading-snug text-foreground">
              {note.title || "Untitled Note"}
            </DialogTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last updated: {formatTimestamp(note.updatedAt)}</span>
            </div>
          </DialogHeader>
          
          <div className="py-4 max-h-[350px] overflow-y-auto">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {note.content || <span className="italic text-muted-foreground">No content.</span>}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
