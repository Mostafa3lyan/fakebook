import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getMessaging, isSupported, type Messaging } from "firebase/messaging"

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "social-app-f1ada.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "social-app-f1ada",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "social-app-f1ada.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
}

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ""

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null
  if (!firebaseConfig.apiKey) {
    return null
  }

  const existingApps = getApps()
  if (existingApps.length > 0) {
    return existingApps[0]
  }

  return initializeApp(firebaseConfig)
}

export async function getClientMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null
  const supported = await isSupported().catch(() => false)
  if (!supported) return null

  const app = getFirebaseApp()
  if (!app) return null

  return getMessaging(app)
}
