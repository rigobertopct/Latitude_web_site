import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  /** Mensaje cuando el backend rechaza el login (ej. cuenta desactivada). Se muestra en la UI y se limpia al cerrar. */
  const blockedMessage = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || '')

  async function init() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (u) => {
        user.value = u
        loading.value = false
        if (u) await syncPortalClient(u)
        resolve(u)
        unsubscribe()
      })
    })
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    user.value = cred.user
    await syncPortalClient(cred.user)
    return cred.user
  }

  async function syncPortalClient(firebaseUser) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = `${baseUrl}/api/clientes/sync-portal`
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.text()
      if (res.status === 403) {
        let detail = 'Tu cuenta está desactivada. Contacte al administrador.'
        try {
          const json = JSON.parse(body)
          if (json.detail) detail = json.detail
        } catch (_) {}
        blockedMessage.value = detail
        await firebaseSignOut(auth)
        user.value = null
        return
      }
      if (!res.ok) {
        console.error(
          '[Auth] No se pudo registrar el cliente en el backend.',
          'URL:', url,
          'Status:', res.status,
          'Respuesta:', body || res.statusText
        )
        return
      }
    } catch (e) {
      console.error(
        '[Auth] Error al sincronizar cliente con el backend (¿backend encendido y CORS?).',
        'URL:', url,
        'Error:', e
      )
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    user.value = null
    blockedMessage.value = null
  }

  function clearBlockedMessage() {
    blockedMessage.value = null
  }

  return {
    user,
    loading,
    isLoggedIn,
    displayName,
    blockedMessage,
    init,
    signInWithGoogle,
    signOut,
    clearBlockedMessage,
  }
})
