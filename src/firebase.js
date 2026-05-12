import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD1p-jR4ydZu216mXNzZGUWvF1yefh33l8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'latitude-dad21.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'latitude-dad21',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'latitude-dad21.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '411328273921',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:411328273921:web:c7cb4c946465f9a65cea00',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WSKMQK2D7Z',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

let analytics = null
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app)
})

export { app, auth, analytics }
