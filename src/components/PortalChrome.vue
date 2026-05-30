<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'
import NavBrandLogo from './NavBrandLogo.vue'

defineProps({
  /** 'productos' | 'cotizar' | 'rastreo' */
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
        confirmButtonColor: '#0a1b3d',
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
        <NavBrandLogo @click="menuOpen = false" />

        <button
          type="button"
          class="portal-menu-btn"
          :aria-expanded="menuOpen"
          aria-label="Menú"
          @click="menuOpen = !menuOpen"
        >
          <span class="material-symbols-outlined">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>

        <div class="portal-header__center" :class="{ 'portal-header__center--open': menuOpen }">
          <nav class="portal-nav">
            <RouterLink :to="{ path: '/', hash: '#servicios' }" class="portal-nav__link" @click="menuOpen = false">
              Servicios
            </RouterLink>
            <RouterLink
              to="/productos"
              class="portal-nav__link"
              :class="{ 'portal-nav__link--active': active === 'productos' }"
              @click="menuOpen = false"
            >
              Productos
            </RouterLink>
            <RouterLink
              to="/rastreo"
              class="portal-nav__link"
              :class="{ 'portal-nav__link--active': active === 'rastreo' }"
              @click="menuOpen = false"
            >
              Rastreo
            </RouterLink>
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
              <div class="user-pill">
                <i class="fas fa-user-circle user-pill__icon" aria-hidden="true"></i>
                <span class="user-pill__name">{{ auth.displayName?.split(' ')[0] || 'Usuario' }}</span>
                <button type="button" class="user-pill__logout" aria-label="Cerrar sesión" @click="handleSignOut">
                  <span class="material-symbols-outlined">logout</span>
                </button>
              </div>
            </template>
            <template v-else>
              <button
                type="button"
                class="portal-auth-btn portal-auth-btn--ghost"
                :disabled="authLoading"
                @click="handleSignInGoogle"
              >
                {{ authLoading ? 'Conectando…' : 'Iniciar sesión' }}
              </button>
            </template>
          </div>
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
          <RouterLink to="/rastreo" class="portal-footer__link">Rastreo</RouterLink>
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
/* Mismo estilo navy que la página principal (Design2Immersive) */
.portal-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #0a1b3d;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.portal-header__inner {
  max-width: 96rem;
  margin: 0 auto;
  padding: 0.5rem clamp(1rem, 3vw, 2rem);
  min-height: 4.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.portal-menu-btn {
  display: none;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
}

.portal-header__center {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.portal-header__center--open {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  order: 4;
  padding-top: 0.5rem;
  gap: 0.75rem;
}

.portal-nav {
  display: none;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  flex-wrap: nowrap;
}

.portal-header__center--open .portal-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.portal-nav__link {
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.2s;
}

.portal-nav__link:hover {
  color: #f27405;
}

.portal-nav__link--active {
  color: #f27405;
}

.portal-header__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.portal-auth-btn {
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.45rem 0.85rem;
}

.portal-auth-btn--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #fff;
}

.portal-auth-btn--ghost:hover:not(:disabled) {
  border-color: #f27405;
  color: #f27405;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 11rem;
  padding: 0.25rem 0.35rem 0.25rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
}

.user-pill__icon {
  font-size: 1.15rem;
  color: #f27405;
}

.user-pill__name {
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.user-pill__logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
}

.user-pill__logout:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.user-pill__logout .material-symbols-outlined {
  font-size: 1.1rem;
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
  color: #f27405;
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

  .portal-header__inner {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    flex-wrap: nowrap;
  }

  .portal-header__center {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: nowrap;
    order: 0;
    width: auto;
    padding-top: 0;
  }

  .portal-header__center--open {
    flex-direction: row;
    align-items: center;
    width: auto;
  }

  .portal-nav {
    display: flex;
    flex: 1;
    justify-content: center;
  }

  .portal-header__center--open .portal-nav {
    flex-direction: row;
    align-items: center;
  }

  .portal-footer__grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .portal-nav__link {
    font-size: 0.9375rem;
  }
}

@media (max-width: 767px) {
  .portal-menu-btn {
    display: block;
  }

  .portal-header__center:not(.portal-header__center--open) {
    display: none;
  }
}
</style>
