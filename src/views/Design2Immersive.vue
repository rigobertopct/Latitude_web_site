<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import heroPoster from '../assets/images/hero-background.jpg'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const authLoading = ref(false)

const navLinks = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'quienes-somos', label: 'Quiénes Somos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'contacto', label: 'Contacto' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

watch(() => auth.blockedMessage, (msg) => {
  if (msg) {
    Swal.fire({
      icon: 'warning',
      title: 'Cuenta desactivada',
      text: msg,
      confirmButtonColor: '#001b48',
    })
    auth.clearBlockedMessage()
  }
})

async function handleSignInGoogle() {
  auth.clearBlockedMessage()
  authLoading.value = true
  try {
    await auth.signInWithGoogle()
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      // Usuario cerró el popup, no mostrar error
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: err.message || 'No se pudo iniciar sesión con Google.',
        confirmButtonColor: '#001b48',
      })
    }
  } finally {
    authLoading.value = false
  }
}

async function handleSignOut() {
  await auth.signOut()
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal')
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="layout">
    <header class="nav">
      <a href="#" class="nav-brand" @click.prevent="scrollTo('inicio')">
        <span class="brand-main">LATITUDE</span>
        <span class="brand-tag">TRANSPORT SERVICES, INC.</span>
      </a>
      <nav class="nav-links">
        <a v-for="link in navLinks" :key="link.id" href="#" class="nav-link" @click.prevent="scrollTo(link.id)">{{ link.label }}</a>
        <RouterLink to="/productos" class="nav-link">Productos</RouterLink>
        <RouterLink to="/cotizar" class="nav-link">Cotizar</RouterLink>
        <template v-if="auth.isLoggedIn">
          <span class="nav-user">Hola, {{ auth.displayName || 'Usuario' }}</span>
          <button type="button" class="nav-btn nav-btn-outline" @click="handleSignOut">Cerrar sesión</button>
        </template>
        <template v-else>
          <button type="button" class="nav-btn-google" :disabled="authLoading" @click="handleSignInGoogle">
            <span class="nav-btn-google-icon-wrap" aria-hidden="true">
              <svg v-if="!authLoading" class="nav-btn-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span v-else class="nav-btn-google-spinner" aria-hidden="true"></span>
            </span>
            <span class="nav-btn-google-text">{{ authLoading ? 'Conectando…' : 'Iniciar sesión' }}</span>
          </button>
        </template>
      </nav>
    </header>

    <section id="inicio" class="hero">
      <div class="hero-bg" aria-hidden="true">
        <video
          class="hero-video"
          autoplay
          muted
          loop
          playsinline
          :poster="heroPoster"
        >
          <source src="/hero-video.mp4" type="video/mp4">
        </video>
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-shine"></div>
      <div class="hero-content">
        <h1 class="hero-title">LATITUDE</h1>
        <span class="hero-accent"></span>
        <p class="hero-tagline">TRANSPORT SERVICES, INC.</p>
        <p class="hero-sub">Rapidez, seguridad y eficiencia en transporte y exportación</p>
        <RouterLink to="/cotizar" class="hero-cta">Solicitar cotización</RouterLink>
      </div>
      <div class="hero-scroll-hint"><span class="scroll-dot"></span></div>
    </section>

    <section class="value-strip animate-on-scroll">
      <div class="value-strip-inner">
        <div class="value-item"><span class="value-num">25+</span><span class="value-label">Años</span></div>
        <div class="value-item"><span class="value-num">USA</span><span class="value-label">Cobertura</span></div>
        <div class="value-item"><span class="value-num">Aduanas</span><span class="value-label">Exportación</span></div>
        <div class="value-item"><span class="value-num">Notaría</span><span class="value-label">Servicios</span></div>
      </div>
    </section>

    <section id="quienes-somos" class="about animate-on-scroll">
      <div class="about-wrap">
        <h2 class="section-title">Quiénes Somos</h2>
        <div class="about-content">
          <div class="about-text">
            <p>Latitude fue fundada en febrero del 2019 por una mujer luchadora, dedicada y apasionada por su trabajo.</p>
            <p>Con más de 25 años de experiencia en la industria de la exportación, hemos brindado apoyo a nuestra comunidad latina en Centroamérica, Sudamérica, México y El Caribe, atendiendo cada una de sus necesidades con compromiso y responsabilidad.</p>
            <p>En Latitude Transport hacemos que sus vehículos y cargas en general se transporten con rapidez, seguridad y eficiencia, ofreciendo siempre el profesionalismo que nos caracteriza.</p>
          </div>
          <div class="about-visual">
            <div class="about-card">
              <span class="about-stat">25+</span>
              <span class="about-stat-label">años de experiencia</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="servicios" class="services animate-on-scroll">
      <div class="services-wrap">
        <h2 class="section-title">Servicios que Ofrecemos</h2>
        <ul class="services-grid">
          <li class="service-card">
            <span class="service-icon-wrap"><span class="service-icon">🚛</span></span>
            <p>Movemos todo tipo de carga y vehículos dentro de los Estados Unidos.</p>
            <span class="service-arrow">→</span>
          </li>
          <li class="service-card">
            <span class="service-icon-wrap"><span class="service-icon">📋</span></span>
            <p>Servicios aduanales en USA para todo tipo de exportación.</p>
            <span class="service-arrow">→</span>
          </li>
          <li class="service-card">
            <span class="service-icon-wrap"><span class="service-icon">📜</span></span>
            <p>Servicios notariales.</p>
            <span class="service-arrow">→</span>
          </li>
          <li class="service-card">
            <span class="service-icon-wrap"><span class="service-icon">🌐</span></span>
            <p>Traducciones para las licencias en las diferentes subastas de USA.</p>
            <span class="service-arrow">→</span>
          </li>
        </ul>
      </div>
    </section>

    <footer id="contacto" class="contact animate-on-scroll">
      <div class="contact-divider"></div>
      <div class="contact-wrap">
        <h2 class="section-title section-title-light">Contacto</h2>
        <div class="contact-grid">
          <a href="https://maps.google.com/?q=121+NW+33rd+Ave+Miami+FL+33125" target="_blank" rel="noopener" class="contact-item">
            <span class="contact-icon">📍</span>
            <span>121 NW 33rd Ave<br>Miami, FL 33125</span>
          </a>
          <a href="tel:+13057759737" class="contact-item">
            <span class="contact-icon">📞</span>
            <span>(305) 775-9737</span>
          </a>
          <a href="mailto:latitudetrans@gmail.com" class="contact-item">
            <span class="contact-icon">✉️</span>
            <span>latitudetrans@gmail.com</span>
          </a>
        </div>
        <div class="contact-social">
          <a href="https://www.instagram.com/latitudetransinc/" target="_blank" rel="noopener" class="social-link social-link-icon" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/latitudetrans/" target="_blank" rel="noopener" class="social-link social-link-icon" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; }

.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: rgba(var(--latitude-navy-rgb), 0.95);
  backdrop-filter: blur(10px);
  color: var(--latitude-white);
}
.nav-brand { text-decoration: none; color: inherit; display: flex; flex-direction: column; }
.brand-main { font-size: 1.35rem; font-weight: 800; font-style: italic; letter-spacing: 0.02em; }
.brand-tag { font-size: 0.65rem; font-weight: 600; opacity: 0.95; letter-spacing: 0.08em; }
.nav-links { display: flex; gap: 1.5rem; align-items: center; }
.nav-link {
  color: var(--latitude-white);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: var(--latitude-orange);
  transition: width 0.3s ease;
}
.nav-link:hover { color: var(--latitude-orange); }
.nav-link:hover::after { width: 100%; }

.nav-user { font-size: 0.9rem; font-weight: 500; opacity: 0.95; }
.nav-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.nav-btn-outline {
  background: transparent;
  color: var(--latitude-white);
  border-color: rgba(255, 255, 255, 0.6);
}
.nav-btn-outline:hover { border-color: var(--latitude-white); background: rgba(255, 255, 255, 0.1); }
.nav-btn-primary {
  background: var(--latitude-orange);
  color: var(--latitude-white);
  border-color: var(--latitude-orange);
}
.nav-btn-primary:hover { filter: brightness(1.1); }

/* Botón Iniciar sesión: icono Google, fondo transparente, borde naranja (como botón cotizar) */
.nav-btn-google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 20px;
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--latitude-white);
  background: transparent;
  border: 2px solid var(--latitude-orange);
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.nav-btn-google:hover:not(:disabled) {
  background: rgba(var(--latitude-orange-rgb), 0.15);
  border-color: var(--latitude-orange);
  color: var(--latitude-white);
  box-shadow: 0 0 12px rgba(var(--latitude-orange-rgb), 0.25);
}
.nav-btn-google:active:not(:disabled) {
  background: rgba(var(--latitude-orange-rgb), 0.25);
}
.nav-btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.nav-btn-google-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.nav-btn-google-icon {
  width: 18px;
  height: 18px;
}
.nav-btn-google-text {
  white-space: nowrap;
}
.nav-btn-google-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e8eaed;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: nav-google-spin 0.7s linear infinite;
}
@keyframes nav-google-spin {
  to { transform: rotate(360deg); }
}

.hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(var(--latitude-navy-rgb), 0.35) 0%, rgba(var(--latitude-navy-rgb), 0.5) 50%, rgba(var(--latitude-navy-rgb), 0.65) 100%);
  pointer-events: none;
}
.hero-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.06) 45%, transparent 55%);
  animation: shine 8s ease-in-out infinite;
  pointer-events: none;
}
.hero-content { position: relative; text-align: center; padding: 2rem; animation: fadeInUp 1s ease-out; }
.hero-title { margin: 0; font-size: clamp(2.8rem, 7vw, 4.5rem); font-weight: 800; font-style: italic; color: var(--latitude-cream); letter-spacing: 0.02em; text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45); }
.hero-accent { display: block; width: 80px; height: 4px; background: var(--latitude-orange); margin: 1rem auto 0; border-radius: 2px; }
.hero-tagline { margin: 0.75rem 0 0; font-size: clamp(0.9rem, 2vw, 1.15rem); font-weight: 600; color: var(--latitude-cream); letter-spacing: 0.1em; text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35); }
.hero-sub { margin: 1.5rem 0 2rem; font-size: 1.05rem; font-weight: 700; color: var(--latitude-cream); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45); max-width: 440px; margin-left: auto; margin-right: auto; }
.hero-cta {
  display: inline-block;
  padding: 1rem 2.25rem;
  background: var(--latitude-orange);
  color: var(--latitude-white);
  font-weight: 700;
  text-decoration: none;
  border-radius: 8px;
  transition: filter 0.2s, transform 0.2s;
  box-shadow: 0 4px 24px rgba(var(--latitude-orange-rgb), 0.4);
  animation: pulse-soft 3s ease-in-out infinite;
}
.hero-cta:hover { filter: brightness(1.15); transform: translateY(-3px); box-shadow: 0 8px 32px rgba(var(--latitude-orange-rgb), 0.5); animation: none; }
.hero-scroll-hint { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); }
.scroll-dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--latitude-orange); animation: scrollBounce 2s ease-in-out infinite; }

.value-strip { background: var(--latitude-blue-gray); padding: 2rem; }
.value-strip-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center; }
.value-item { padding: 1rem; background: rgba(255, 255, 255, 0.6); border-radius: 12px; }
.value-num { display: block; font-size: 1.5rem; font-weight: 800; color: var(--latitude-orange); }
.value-label { font-size: 0.85rem; font-weight: 600; color: var(--latitude-deep-blue); }

.animate-on-scroll { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
.animate-on-scroll.reveal { opacity: 1; transform: translateY(0); }

.about { background: var(--latitude-white); padding: 4rem 2rem; }
.about-wrap { max-width: 960px; margin: 0 auto; }
.section-title { margin: 0 0 2rem; font-size: 1.75rem; font-weight: 800; color: var(--latitude-deep-blue); }
.about-content { display: grid; grid-template-columns: 1fr auto; gap: 2.5rem; align-items: start; }
.about-text p { margin: 0 0 1rem; line-height: 1.65; color: #2d3748; }
.about-card { background: var(--latitude-blue-gray); padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 20px rgba(var(--latitude-navy-rgb), 0.12); transition: transform 0.3s, box-shadow 0.3s; }
.about-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(var(--latitude-navy-rgb), 0.18); }
.about-stat { display: block; font-size: 2.5rem; font-weight: 800; color: var(--latitude-orange); }
.about-stat-label { font-size: 0.9rem; color: var(--latitude-deep-blue); font-weight: 600; }

.services { background: var(--latitude-blue-gray); padding: 4rem 2rem; }
.services-wrap { max-width: 960px; margin: 0 auto; }
.services-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.service-card {
  padding: 1.75rem;
  border-radius: 12px;
  background: var(--latitude-white);
  border: 2px solid transparent;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  position: relative;
}
.service-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(var(--latitude-navy-rgb), 0.12); border-color: var(--latitude-orange); }
.service-icon-wrap { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background: rgba(var(--latitude-orange-rgb), 0.2); margin-bottom: 1rem; }
.service-icon { font-size: 1.5rem; }
.service-card p { margin: 0; line-height: 1.55; color: #2d3748; font-size: 0.95rem; }
.service-arrow { position: absolute; bottom: 1.25rem; right: 1.25rem; color: var(--latitude-orange); font-size: 1.25rem; font-weight: 700; opacity: 0; transform: translateX(-8px); transition: opacity 0.3s, transform 0.3s; }
.service-card:hover .service-arrow { opacity: 1; transform: translateX(0); }

.contact { background: var(--latitude-deep-blue); color: var(--latitude-white); padding: 4rem 2rem; position: relative; }
.contact-divider { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 4px; background: var(--latitude-orange); border-radius: 0 0 2px 2px; }
.contact-wrap { max-width: 720px; margin: 0 auto; text-align: center; }
.section-title-light { color: var(--latitude-white); }
.contact-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; margin-bottom: 2rem; }
.contact-item { display: flex; align-items: flex-start; gap: 0.75rem; color: var(--latitude-white); text-decoration: none; text-align: left; transition: color 0.2s, transform 0.2s; }
.contact-item:hover { color: var(--latitude-orange); transform: translateY(-2px); }
.contact-icon { font-size: 1.25rem; }
.contact-social { display: flex; justify-content: center; gap: 1rem; }
.social-link { text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
.social-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--latitude-orange);
  color: var(--latitude-white);
  border-radius: 50%;
}
.social-link-icon:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(var(--latitude-orange-rgb), 0.4); }
.social-link-icon svg { flex-shrink: 0; }

@media (max-width: 768px) {
  .hero-bg { background-attachment: scroll; }
  .nav { flex-direction: column; gap: 1rem; }
  .value-strip-inner { grid-template-columns: repeat(2, 1fr); }
  .about-content { grid-template-columns: 1fr; }
  .contact-grid { flex-direction: column; align-items: center; }
}
</style>
