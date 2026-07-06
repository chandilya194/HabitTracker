"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, FileText, X } from "lucide-react"
import { useNotesStore } from "@/lib/notes-store"
import { useTaskStore } from "@/lib/task-store"
import { NoteCard } from "@/components/note-card"
import { AddNoteModal } from "@/components/add-note-modal"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Note } from "@/lib/types"

export default function NotesPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useTaskStore()
  const { notes, loading: notesLoading } = useNotesStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-[#ff5f40] font-semibold text-lg">Loading...</div>
      </div>
    )
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6 md:pl-20 lg:pl-64">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Notes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Jot down thoughts, habits, or reminders
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

      {/* Main Content */}
      <main className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Search and Action Bar */}
        <div className="flex gap-3 mb-6 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground p-0.5 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex gap-2 items-center bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Notes Grid */}
        {notesLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/30 px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No matching notes" : "No notes yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
              {searchQuery
                ? "Try searching for a different keyword or create a new note."
                : "Create notes to organize tasks, track longer habits, or capture quick ideas."}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {searchQuery ? "Create New Note" : "Write Your First Note"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile only) */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 md:hidden w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add note</span>
      </Button>

      {/* Navigation Layout */}
      <BottomNav />

      {/* Add / Edit Note Modal */}
      <AddNoteModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        editingNote={editingNote}
      />
    </div>
  )
}
