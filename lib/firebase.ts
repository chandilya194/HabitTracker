import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check if we have the minimum required Firebase configuration to initialize
const isFirebaseConfigured =
  !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "YOUR_FIREBASE_PROJECT_ID" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY")

let db: any = null
let auth: any = null

if (isFirebaseConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
  } catch (error) {
    console.error("Error initializing Firebase App / Firestore / Auth:", error)
  }
} else {
  // Only log this warning in the browser context once
  if (typeof window !== "undefined") {
    console.warn(
      "Firebase environment variables are missing. Falling back to local in-memory store mode."
    )
  }
}

export { db, auth }
