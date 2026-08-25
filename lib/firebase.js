import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import firebaseConfig from '../firebase-applet-config.json'

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

/* CRITICAL: Must pass firestoreDatabaseId for custom firestore instance */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export default app
