"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useNotesStore } from "@/lib/notes-store"
import type { Note } from "@/lib/types"

interface AddNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingNote?: Note | null
}

export const colorOptions = [
  { id: "slate", name: "Classic Slate", class: "border-border", dotClass: "bg-muted-foreground/30 border-muted-foreground/50" },
  { id: "lavender", name: "Lavender", class: "border-purple-300 dark:border-purple-800/60", dotClass: "bg-purple-400 border-purple-500" },
  { id: "sage", name: "Sage", class: "border-emerald-300 dark:border-emerald-800/60", dotClass: "bg-emerald-400 border-emerald-500" },
  { id: "rose", name: "Rose", class: "border-rose-300 dark:border-rose-800/60", dotClass: "bg-rose-400 border-rose-500" },
  { id: "amber", name: "Amber", class: "border-amber-300 dark:border-amber-800/60", dotClass: "bg-amber-400 border-amber-500" },
  { id: "sky", name: "Sky", class: "border-sky-300 dark:border-sky-800/60", dotClass: "bg-sky-400 border-sky-500" },
]

export function AddNoteModal({ open, onOpenChange, editingNote }: AddNoteModalProps) {
  const { addNote, updateNote } = useNotesStore()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState("slate")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setColor(editingNote.color || "slate")
      setIsSubmitting(false)
    } else if (open) {
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, "0")
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const yyyy = today.getFullYear()
      setTitle(`${dd}.${mm}.${yyyy}`)
      setContent("")
      setColor("slate")
      setIsSubmitting(false)
    }
  }, [editingNote, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    if (!title.trim() && !content.trim()) return

    setIsSubmitting(true)

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      color,
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData)
      } else {
        await addNote(noteData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Note Content</Label>
            <Textarea
              id="note-content"
              placeholder="Start typing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] resize-y"
            />
          </div>

          <div className="space-y-3">
            <Label>Card Color</Label>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setColor(option.id)}
                  className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center hover:scale-105 ${
                    color === option.id
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent"
                  }`}
                  title={option.name}
                >
                  <span className={`w-6 h-6 rounded-full border ${option.dotClass}`} />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingNote ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
