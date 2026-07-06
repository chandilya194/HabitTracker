"use client"

import { create } from "zustand"
import type { Note } from "./types"
import { db, auth } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

interface NotesStore {
  notes: Note[]
  loading: boolean
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
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

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: db ? true : false,

  addNote: async (noteData) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newNote: Note = {
      ...noteData,
      id,
      createdAt: now,
      updatedAt: now,
    }

    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        await setDoc(doc(db, "users", uid, "notes", id), cleanUndefinedFields(newNote))
      } catch (error) {
        console.error("Error adding note to Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({ notes: [...state.notes, newNote] }))
    }
  },

  updateNote: async (id, updates) => {
    const now = new Date().toISOString()
    const finalUpdates = {
      ...updates,
      updatedAt: now,
    }

    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        await updateDoc(doc(db, "users", uid, "notes", id), cleanUndefinedFields(finalUpdates))
      } catch (error) {
        console.error("Error updating note in Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...finalUpdates } : note
        ),
      }))
    }
  },

  deleteNote: async (id) => {
    const uid = auth?.currentUser?.uid
    if (db && uid) {
      try {
        await deleteDoc(doc(db, "users", uid, "notes", id))
      } catch (error) {
        console.error("Error deleting note from Firestore:", error)
      }
    } else {
      // Local fallback
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }))
    }
  },
}))

// Subscription cleanup
let unsubscribeNotes: (() => void) | null = null

// Start real-time Firestore synchronization if db and auth are available in the browser
if (db && auth && typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    // Clean up any existing listeners first
    if (unsubscribeNotes) {
      unsubscribeNotes()
      unsubscribeNotes = null
    }

    if (user) {
      useNotesStore.setState({ loading: true })
      
      const uid = user.uid
      const notesRef = collection(db, "users", uid, "notes")
      
      unsubscribeNotes = onSnapshot(notesRef, (notesSnapshot) => {
        const dbNotes: Note[] = []
        notesSnapshot.forEach((docSnap) => {
          dbNotes.push({ id: docSnap.id, ...docSnap.data() } as Note)
        })
        
        // Sort notes: newest first (based on updatedAt or createdAt)
        dbNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        
        useNotesStore.setState({
          notes: dbNotes,
          loading: false,
        })
      }, (error) => {
        console.error("Error in Firestore notes subscription:", error)
        useNotesStore.setState({ loading: false })
      })
      
    } else {
      // Not authenticated: clear notes and loading state
      useNotesStore.setState({
        notes: [],
        loading: false,
      })
    }
  })
}
