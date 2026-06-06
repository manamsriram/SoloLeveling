import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

export const isConfigured = Boolean(apiKey && projectId)

const app = isConfigured
  ? (getApps()[0] ?? initializeApp({
      apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }))
  : null

export const firestore = app ? getFirestore(app) : null!
export const auth = app ? getAuth(app) : null!

export async function signInSilently(): Promise<void> {
  if (!isConfigured || !auth) return
  if (auth.currentUser) return
  const email = process.env.NEXT_PUBLIC_FIREBASE_USER_EMAIL
  const password = process.env.NEXT_PUBLIC_FIREBASE_USER_PASSWORD
  if (!email || !password) return
  await signInWithEmailAndPassword(auth, email, password)
}
