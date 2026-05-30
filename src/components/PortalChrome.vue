<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'

defineProps({
  /** 'productos' | 'cotizar' */
  active: {
    type: String,
    default: '',
  },
})

const auth = useAuthStore()
const authLoading = ref(false)
const menuOpen = ref(false)

async function handleSignInGoogle() {
  authLoading.value = true
  try {
    await auth.signInWithGoogle()
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
      await Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: err.message || 'No se pudo iniciar sesión con Google.',
        confirmButtonColor: '#0051d5',
      })
    }
  } finally {
    authLoading.value = false
  }
}

async function handleSignOut() {
  await auth.signOut()
}
</script>

<template>
  <div class="portal-chrome">
    <header class="portal-header">
      <div class="portal-header__inner">
        <RouterLink to="/" class="portal-logo" @click="menuOpen = false">Latitude</RouterLink>

        <button
          type="button"
          class="portal-menu-btn"
          :aria-expanded="menuOpen"
          aria-label="Menú"
          @click="menuOpen = !menuOpen"
        >
          <span class="material-symbols-outlined">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>

        <nav class="portal-nav" :class="{ 'portal-nav--open': menuOpen }">
          <RouterLink :to="{ path: '/', hash: '#servicios' }" class="portal-nav__link" @click="menuOpen = false">Servicios</RouterLink>
          <RouterLink
            to="/productos"
            class="portal-nav__link"
            :class="{ 'portal-nav__link--active': active === 'productos' }"
            @click="menuOpen = false"
          >
            Productos
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#cobertura' }" class="portal-nav__link" @click="menuOpen = false">Rastreo</RouterLink>
          <RouterLink
            to="/cotizar"
            class="portal-nav__link"
            :class="{ 'portal-nav__link--active': active === 'cotizar' }"
            @click="menuOpen = false"
          >
            Cotizar
          </RouterLink>
        </nav>

        <div class="portal-header__actions">
          <template v-if="auth.isLoggedIn">
            <span class="portal-user">{{ auth.displayName?.split(' ')[0] || 'Usuario' }}</span>
            <button type="button" class="portal-link-btn" @click="handleSignOut">Salir</button>
          </template>
          <template v-else>
            <button
              type="button"
              class="portal-link-btn portal-link-btn--hide-mobile"
              :disabled="authLoading"
              @click="handleSignInGoogle"
            >
              {{ authLoading ? 'Conectando…' : 'Iniciar sesión' }}
            </button>
            <button
              type="button"
              class="portal-register-btn portal-register-btn--hide-mobile"
              :disabled="authLoading"
              @click="handleSignInGoogle"
            >
              Registrarse
            </button>
          </template>
        </div>
      </div>
    </header>

    <slot />

    <footer class="portal-footer">
      <div class="portal-footer__grid">
        <div>
          <div class="portal-footer__brand">Latitude</div>
          <p class="portal-footer__text">
            Liderando el futuro de la logística global con tecnología de vanguardia y precisión en cada entrega.
          </p>
        </div>
        <div>
          <h4 class="label-caps portal-footer__heading">Recursos</h4>
          <RouterLink to="/" class="portal-footer__link">Inicio</RouterLink>
          <RouterLink to="/productos" class="portal-footer__link">Productos</RouterLink>
          <RouterLink to="/cotizar" class="portal-footer__link">Cotizar</RouterLink>
        </div>
        <div>
          <h4 class="label-caps portal-footer__heading">Contacto</h4>
          <p class="portal-footer__text">info@latitudetransport.com</p>
          <p class="portal-footer__text">+1 (305) 775-9737</p>
        </div>
      </div>
      <p class="portal-footer__copy">© 2024 Latitude Transport Services, Inc. Conectando mercados globales con precisión.</p>
    </footer>
  </div>
</template>

<style scoped>
.portal-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #f8f9ff;
  border-bottom: 1px solid #c6c6cd;
}

.portal-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem clamp(1rem, 4vw, 3rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.portal-logo {
  font-family: 'Hanken Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0b1c30;
  text-decoration: none;
  flex-shrink: 0;
}

.portal-menu-btn {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #0b1c30;
}

.portal-nav {
  display: none;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.portal-nav--open {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  order: 4;
  padding-top: 0.5rem;
}

.portal-nav__link {
  color: #45464d;
  text-decoration: none;
  font-size: 1rem;
  white-space: nowrap;
  transition: color 0.2s;
}

.portal-nav__link:hover {
  color: #0051d5;
}

.portal-nav__link--active {
  color: #0051d5;
  font-weight: 700;
  border-bottom: 2px solid #0051d5;
  padding-bottom: 2px;
}

.portal-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  flex-shrink: 0;
}

.portal-user {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0b1c30;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portal-link-btn {
  background: none;
  border: none;
  color: #45464d;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
}

.portal-link-btn:hover {
  color: #0051d5;
}

.portal-register-btn {
  background: #0051d5;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.portal-register-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.portal-footer {
  margin-top: 4rem;
  background: #131b2e;
  color: #fff;
  padding: 4rem clamp(1rem, 4vw, 3rem) 2rem;
}

.portal-footer__grid {
  max-width: 1280px;
  margin: 0 auto 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.portal-footer__brand {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.portal-footer__heading {
  color: #fff;
  margin: 0 0 1rem;
}

.portal-footer__text {
  margin: 0 0 0.5rem;
  color: #7c839b;
  font-size: 1rem;
  line-height: 1.5;
}

.portal-footer__link {
  display: block;
  color: #7c839b;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.portal-footer__link:hover {
  color: #fff;
}

.portal-footer__copy {
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #7c839b;
  font-size: 0.9375rem;
}

@media (min-width: 768px) {
  .portal-menu-btn {
    display: none;
  }

  .portal-nav {
    display: flex;
  }

  .portal-nav--open {
    flex-direction: row;
    width: auto;
    order: 0;
  }

  .portal-header__inner {
    flex-wrap: nowrap;
  }

  .portal-footer__grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .portal-menu-btn {
    display: block;
  }

  .portal-nav:not(.portal-nav--open) {
    display: none;
  }

  .portal-link-btn--hide-mobile,
  .portal-register-btn--hide-mobile {
    display: none;
  }

  .portal-header__actions {
    margin-left: 0;
  }
}
</style>
