<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import heroImage from '../assets/images/hero-background.jpg'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const authLoading = ref(false)
const mobileNavOpen = ref(false)

const userFirstName = computed(() => {
  const raw = auth.displayName || auth.user?.email?.split('@')[0] || 'Usuario'
  return raw.trim().split(/\s+/)[0] || 'Usuario'
})

const WHATSAPP_URL = 'https://wa.me/13057759737'

const navLinks = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'por-que-elegir', label: 'Quiénes Somos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'cobertura', label: 'Cobertura' },
  { id: 'productos', label: 'Productos', route: '/productos' },
  { id: 'contacto', label: 'Contacto' },
]

const stats = [
  { icon: 'fa-award', title: '25+', subtitle: 'Años de experiencia' },
  { icon: 'fa-globe-americas', title: 'Cobertura', subtitle: 'Internacional' },
  { icon: 'fa-file-invoice', title: 'Servicio de', subtitle: 'Aduanas' },
  { icon: 'fa-pen-nib', title: 'Gestión', subtitle: 'Notarial' },
  { icon: 'fa-user-tie', title: 'Atención', subtitle: 'Personalizada', wide: true },
]

const services = [
  {
    icon: 'fa-truck-moving',
    title: 'Transporte Internacional',
    text: 'Transporte seguro de vehículos, carga comercial y envíos especiales.',
  },
  {
    icon: 'fa-box-open',
    title: 'Exportación',
    text: 'Gestión integral de exportaciones hacia Latinoamérica.',
  },
  {
    icon: 'fa-file-signature',
    title: 'Aduanas',
    text: 'Asesoría y trámites aduanales para garantizar procesos rápidos y seguros.',
  },
  {
    icon: 'fa-gavel',
    title: 'Notaría',
    text: 'Documentación legal, poderes y certificaciones internacionales.',
  },
  {
    icon: 'fa-network-wired',
    title: 'Logística Integral',
    text: 'Coordinación completa puerta a puerta para tu tranquilidad.',
  },
]

const whyChoose = [
  'Atención personalizada',
  'Equipo especializado',
  'Seguimiento de carga',
  'Seguridad garantizada',
  'Procesos rápidos',
  'Soporte permanente',
]

const processSteps = [
  {
    n: 1,
    icon: 'fa-file-invoice-dollar',
    title: 'Solicita tu cotización',
    text: 'Cuéntanos qué necesitas enviar y te brindamos la mejor opción.',
  },
  {
    n: 2,
    icon: 'fa-box',
    title: 'Recibimos tu carga',
    text: 'Recogemos tu mercancía en el punto acordado con seguridad.',
  },
  {
    n: 3,
    icon: 'fa-clipboard-list',
    title: 'Gestionamos documentos',
    text: 'Nos encargamos de todos los trámites y procesos aduanales.',
  },
  {
    n: 4,
    icon: 'fa-ship',
    title: 'Transportamos',
    text: 'Movemos tu carga con puntualidad y responsabilidad.',
  },
  {
    n: 5,
    icon: 'fa-circle-check',
    title: 'Entrega final',
    text: 'Tu carga llega a destino de forma segura y en el tiempo acordado.',
  },
]

const testimonials = [
  {
    quote: 'Excelente servicio, enviaron mi vehículo sin inconvenientes. Muy profesionales.',
    author: 'Carlos M.',
  },
  {
    quote: 'Muy eficientes en todo el proceso de exportación. 100% recomendados.',
    author: 'María R.',
  },
]

const destinationsCol1 = [
  { flag: '🇺🇸', name: 'Estados Unidos' },
  { flag: '🇲🇽', name: 'México' },
  { flag: '🇨🇺', name: 'Cuba' },
  { flag: '🇩🇴', name: 'República Dominicana' },
]

const destinationsCol2 = [
  { flag: '🇨🇴', name: 'Colombia' },
  { flag: '🇵🇦', name: 'Panamá' },
  { flag: '🇭🇳', name: 'Honduras' },
  { flag: '🇬🇹', name: 'Guatemala' },
]

function scrollTo(id) {
  mobileNavOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function onNavClick(link) {
  if (link.route) {
    mobileNavOpen.value = false
    return
  }
  scrollTo(link.id)
}

watch(() => auth.blockedMessage, (msg) => {
  if (msg) {
    Swal.fire({
      icon: 'warning',
      title: 'Cuenta desactivada',
      text: msg,
      confirmButtonColor: '#0a1b3d',
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
      // Usuario cerró el popup
    } else {
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

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal')
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="landing">
    <header class="site-header">
      <div class="header-shell">
        <a href="#" class="brand" @click.prevent="scrollTo('inicio')">
          <span class="brand-main">LATITUDE</span>
          <span class="brand-sub">TRANSPORT SERVICES, INC.</span>
        </a>

        <button
          type="button"
          class="nav-toggle"
          :aria-expanded="mobileNavOpen"
          aria-label="Menú"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <i class="fas" :class="mobileNavOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>

        <div class="header-center" :class="{ 'header-center--open': mobileNavOpen }">
          <nav class="site-nav">
            <template v-for="link in navLinks" :key="link.label">
              <RouterLink
                v-if="link.route"
                :to="link.route"
                class="nav-link"
                @click="mobileNavOpen = false"
              >
                {{ link.label }}
              </RouterLink>
              <a
                v-else
                href="#"
                class="nav-link"
                @click.prevent="onNavClick(link)"
              >
                {{ link.label }}
              </a>
            </template>
          </nav>

          <div class="header-auth">
            <template v-if="auth.isLoggedIn">
              <div class="user-pill" :title="auth.displayName || userFirstName">
                <i class="fas fa-user-circle user-pill__icon" aria-hidden="true"></i>
                <span class="user-pill__name">{{ userFirstName }}</span>
                <button type="button" class="user-pill__logout" aria-label="Cerrar sesión" @click="handleSignOut">
                  <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                </button>
              </div>
            </template>
            <button
              v-else
              type="button"
              class="btn btn-outline-sm"
              :disabled="authLoading"
              @click="handleSignInGoogle"
            >
              <i class="fab fa-google" aria-hidden="true"></i>
              {{ authLoading ? 'Conectando…' : 'Iniciar sesión' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <section id="inicio" class="hero" :style="{ '--hero-image': `url(${heroImage})` }">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="hero-kicker">25+ Años de Experiencia</span>
          <h1 class="hero-title">
            Transportamos tu carga con seguridad desde
            <span class="text-orange">Estados Unidos</span>
            hacia
            <span class="text-orange">Latinoamérica</span>
          </h1>
          <p class="hero-lead">
            Soluciones integrales de transporte, exportación, aduanas y gestión documental.
          </p>
          <div class="hero-actions">
            <RouterLink to="/cotizar" class="btn btn-orange">
              <i class="fas fa-calculator"></i> Solicitar cotización
            </RouterLink>
            <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer" class="btn btn-outline-white">
              <i class="fab fa-whatsapp"></i> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="stats-bar">
      <div class="container stats-grid">
        <div
          v-for="(item, i) in stats"
          :key="i"
          class="stat-item"
          :class="{ 'stat-item--wide': item.wide }"
        >
          <i class="fas text-orange" :class="item.icon"></i>
          <span class="stat-title">{{ item.title }}</span>
          <span class="stat-sub">{{ item.subtitle }}</span>
        </div>
      </div>
    </div>

    <section id="servicios" class="section section-muted animate-on-scroll">
      <div class="container">
        <h2 class="section-heading">Nuestros Servicios</h2>
        <div class="services-grid">
          <article v-for="svc in services" :key="svc.title" class="service-card">
            <div class="service-icon"><i class="fas" :class="svc.icon"></i></div>
            <h3>{{ svc.title }}</h3>
            <p>{{ svc.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="por-que-elegir" class="section animate-on-scroll">
      <div class="container why-grid">
        <div class="why-media">
          <img :src="heroImage" alt="Operaciones logísticas Latitude" class="why-img" />
        </div>
        <div class="why-content">
          <span class="kicker">¿POR QUÉ ELEGIR LATITUDE?</span>
          <h2 class="why-title">Más de 25 años conectando Estados Unidos con Latinoamérica</h2>
          <p class="why-lead">
            Nos especializamos en ofrecer soluciones logísticas confiables, rápidas y eficientes.
          </p>
          <ul class="why-list">
            <li v-for="item in whyChoose" :key="item">
              <i class="fas fa-check-circle text-orange"></i>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section section-muted animate-on-scroll">
      <div class="container">
        <h2 class="section-heading">Cómo funciona nuestro proceso</h2>
        <div class="process-grid">
          <div v-for="step in processSteps" :key="step.n" class="process-step">
            <div class="process-num">{{ step.n }}</div>
            <div class="process-icon"><i class="fas" :class="step.icon"></i></div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="cobertura" class="section animate-on-scroll">
      <div class="container coverage-grid">
        <div class="testimonials">
          <h3>Lo que dicen nuestros clientes</h3>
          <div class="testimonial-list">
            <blockquote v-for="t in testimonials" :key="t.author" class="testimonial-card">
              <div class="stars">
                <i v-for="n in 5" :key="n" class="fas fa-star"></i>
              </div>
              <p>"{{ t.quote }}"</p>
              <cite>— {{ t.author }}</cite>
            </blockquote>
          </div>
          <div class="testimonial-dots" aria-hidden="true">
            <span class="dot dot--active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <div class="coverage">
          <h3>Cobertura Internacional</h3>
          <div class="map-wrap">
            <img :src="heroImage" alt="Cobertura internacional Latitude" class="map-img" />
          </div>
          <div class="destinations">
            <ul>
              <li v-for="d in destinationsCol1" :key="d.name">
                <span>{{ d.flag }}</span> {{ d.name }}
              </li>
            </ul>
            <ul>
              <li v-for="d in destinationsCol2" :key="d.name">
                <span>{{ d.flag }}</span> {{ d.name }}
              </li>
            </ul>
          </div>
          <button type="button" class="btn btn-outline-navy" @click="scrollTo('cobertura')">
            Ver todos los destinos
          </button>
        </div>
      </div>
    </section>

    <section class="cta-band">
      <div class="container cta-inner">
        <div class="cta-text">
          <h2>¿Necesitas transportar o exportar tu carga?</h2>
          <p>Más de 25 años ofreciendo soluciones rápidas, seguras y eficientes.</p>
        </div>
        <div class="cta-actions">
          <RouterLink to="/cotizar" class="btn btn-orange">Solicitar cotización</RouterLink>
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer" class="btn btn-outline-white">
            <i class="fab fa-whatsapp"></i> Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>

    <footer id="contacto" class="site-footer">
      <div class="container footer-grid">
        <div>
          <h4 class="footer-brand">LATITUDE</h4>
          <p class="footer-brand-sub">TRANSPORT SERVICES, INC.</p>
          <p class="footer-tagline">Transportamos tu confianza, entregamos soluciones.</p>
        </div>
        <div>
          <h5>Enlaces rápidos</h5>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="scrollTo('inicio')">Inicio</a></li>
            <li><a href="#" @click.prevent="scrollTo('por-que-elegir')">Quiénes Somos</a></li>
            <li><a href="#" @click.prevent="scrollTo('servicios')">Servicios</a></li>
            <li><a href="#" @click.prevent="scrollTo('cobertura')">Cobertura</a></li>
            <li><RouterLink to="/productos">Productos</RouterLink></li>
            <li><a href="#" @click.prevent="scrollTo('contacto')">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h5>Servicios</h5>
          <ul class="footer-links">
            <li v-for="svc in services" :key="'f-' + svc.title">
              <a href="#" @click.prevent="scrollTo('servicios')">{{ svc.title }}</a>
            </li>
          </ul>
        </div>
        <div>
          <h5>Contacto</h5>
          <ul class="footer-contact">
            <li><i class="fas fa-phone-alt text-orange"></i><span>+1 (305) 775-9737</span></li>
            <li><i class="fas fa-envelope text-orange"></i><span>info@latitudetransport.com</span></li>
            <li><i class="fas fa-map-marker-alt text-orange"></i><span>Miami, Florida, USA</span></li>
          </ul>
          <div class="footer-social">
            <a href="https://www.facebook.com/latitudetrans/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/latitudetransinc/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© 2024 Latitude Transport Services, Inc. Todos los derechos reservados.</p>
        <div class="cert-badge">
          <i class="fas fa-shield-alt text-orange"></i>
          <div>Certified<br />&amp; Insured</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  --lat-navy: #0a1b3d;
  --lat-orange: #f27405;
  --lat-navy-rgb: 10, 27, 61;
  color: #1f2937;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.container {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-orange {
  color: var(--lat-orange);
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--lat-navy);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-shell {
  width: 100%;
  max-width: 96rem;
  margin: 0 auto;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: 0;
}

.brand-main {
  font-size: 1.15rem;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.02em;
  line-height: 1.1;
}

.brand-sub {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  opacity: 0.95;
  white-space: nowrap;
}

.nav-toggle {
  display: none;
  margin-left: auto;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.35rem;
  cursor: pointer;
  padding: 0.35rem;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.site-nav {
  display: none;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: nowrap;
}

.header-center--open {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  order: 4;
  padding-top: 0.5rem;
  gap: 0.75rem;
}

.header-center--open .site-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.header-center--open .header-auth {
  align-self: flex-start;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.2s;
  line-height: 1.2;
}

.nav-link:hover {
  color: var(--lat-orange);
}

.header-auth {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  color: var(--lat-orange);
  flex-shrink: 0;
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
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.user-pill__logout:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  font-size: 0.95rem;
  white-space: nowrap;
}

.btn-orange {
  background: var(--lat-orange);
  color: #fff;
}

.btn-orange:hover {
  background: #e06604;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-outline-white {
  background: transparent;
  border-color: #fff;
  color: #fff;
}

.btn-outline-white:hover {
  background: #fff;
  color: var(--lat-navy);
}

.btn-outline-navy {
  background: transparent;
  border: 2px solid var(--lat-navy);
  color: var(--lat-navy);
}

.btn-outline-navy:hover {
  background: var(--lat-navy);
  color: #fff;
}

.btn-outline-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.65);
  color: #fff;
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

/* Hero */
.hero {
  min-height: 600px;
  display: flex;
  align-items: center;
  color: #fff;
  background:
    linear-gradient(rgba(10, 27, 61, 0.8), rgba(10, 27, 61, 0.4)),
    var(--hero-image) center / cover no-repeat;
}

.hero-inner {
  padding: 5rem 1rem;
}

.hero-copy {
  max-width: 42rem;
}

.hero-kicker {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.hero-title {
  margin: 0 0 1.5rem;
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.15;
}

.hero-lead {
  margin: 0 0 2rem;
  font-size: 1.125rem;
  color: #e5e7eb;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Stats */
.stats-bar {
  background: var(--lat-navy);
  padding: 2rem 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  text-align: center;
  color: #fff;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.stat-item i {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-weight: 700;
}

.stat-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}

.stat-item--wide {
  grid-column: span 2;
}

/* Sections */
.section {
  padding: 5rem 1rem;
}

.section-muted {
  background: #f9fafb;
}

.section-heading {
  margin: 0 0 3rem;
  text-align: center;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--lat-navy);
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.service-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-top: 4px solid var(--lat-orange);
}

.service-icon {
  color: var(--lat-navy);
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.service-card h3 {
  margin: 0 0 0.75rem;
  color: var(--lat-navy);
  font-size: 1rem;
}

.service-card p {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.55;
}

.why-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

.why-img {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  display: block;
}

.kicker {
  color: var(--lat-orange);
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
}

.why-title {
  margin: 0.5rem 0 1.5rem;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--lat-navy);
  line-height: 1.2;
}

.why-lead {
  margin: 0 0 2rem;
  color: #4b5563;
  line-height: 1.65;
}

.why-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.why-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.process-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.process-step {
  text-align: center;
  padding: 0 1rem;
}

.process-num {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: var(--lat-orange);
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-icon {
  color: var(--lat-navy);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.process-step h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.process-step p {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.5;
}

.coverage-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

.testimonials {
  background: var(--lat-navy);
  color: #fff;
  padding: 2.5rem;
  border-radius: 1rem;
}

.testimonials h3 {
  margin: 0 0 2.5rem;
  font-size: 1.5rem;
}

.testimonial-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.testimonial-card {
  margin: 0;
  padding: 1.5rem;
  background: rgba(30, 58, 138, 0.3);
  border-left: 4px solid var(--lat-orange);
  border-radius: 0.5rem;
}

.stars {
  color: var(--lat-orange);
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.testimonial-card p {
  margin: 0 0 1rem;
  font-style: italic;
  color: #d1d5db;
  line-height: 1.55;
}

.testimonial-card cite {
  font-style: normal;
  font-weight: 700;
}

.testimonial-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #6b7280;
}

.dot--active {
  background: var(--lat-orange);
}

.coverage h3 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: var(--lat-navy);
}

.map-wrap {
  background: #eff6ff;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-img {
  max-width: 100%;
  height: auto;
  opacity: 0.72;
  border-radius: 0.75rem;
}

.destinations {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.destinations ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.destinations li {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.cta-band {
  background: var(--lat-navy);
  border-top: 4px solid var(--lat-orange);
  padding: 3rem 1rem;
}

.cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.cta-text {
  color: #fff;
  text-align: center;
}

.cta-text h2 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 3vw, 1.875rem);
}

.cta-text p {
  margin: 0;
  color: #d1d5db;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 420px;
}

/* Footer */
.site-footer {
  background: #fff;
  border-top: 1px solid #f3f4f6;
  padding: 4rem 1rem 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.footer-brand {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--lat-navy);
}

.footer-brand-sub {
  margin: 0 0 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: -0.02em;
}

.footer-tagline {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.site-footer h5 {
  margin: 0 0 1.5rem;
  color: var(--lat-navy);
  font-size: 1rem;
}

.footer-links,
.footer-contact {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #4b5563;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--lat-orange);
}

.footer-contact li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.footer-contact i {
  margin-top: 0.15rem;
}

.footer-social {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.footer-social a {
  color: var(--lat-navy);
  font-size: 1.25rem;
  transition: color 0.2s;
}

.footer-social a:hover {
  color: var(--lat-orange);
}

.footer-bottom {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}

.cert-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  line-height: 1.2;
}

.cert-badge i {
  font-size: 1.25rem;
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.animate-on-scroll.reveal {
  opacity: 1;
  transform: translateY(0);
}

@media (min-width: 768px) {
  .nav-toggle {
    display: none;
  }

  .header-shell {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 1rem;
    padding: 0.6rem 1.25rem;
  }

  .header-center {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: nowrap;
    order: 0;
    width: auto;
    padding-top: 0;
  }

  .header-center--open {
    flex-direction: row;
    align-items: center;
    width: auto;
    padding-top: 0;
  }

  .site-nav {
    display: flex;
    flex: 1;
    justify-content: center;
    flex-wrap: nowrap;
    gap: clamp(0.45rem, 1.1vw, 0.85rem);
  }

  .header-center--open .site-nav {
    flex-direction: row;
    align-items: center;
  }

  .nav-link {
    font-size: clamp(0.75rem, 0.95vw, 0.8125rem);
  }

  .stats-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .stat-item--wide {
    grid-column: auto;
  }

  .services-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .why-grid {
    grid-template-columns: 1fr 1fr;
  }

  .why-list {
    grid-template-columns: 1fr 1fr;
  }

  .process-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .coverage-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cta-inner {
    flex-direction: row;
    justify-content: space-between;
  }

  .cta-text {
    text-align: left;
    max-width: 50%;
  }

  .cta-actions {
    flex-direction: row;
    width: auto;
    max-width: none;
  }

  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (min-width: 1100px) {
  .brand-main {
    font-size: 1.25rem;
  }

  .brand-sub {
    font-size: 0.62rem;
  }

  .nav-link {
    font-size: 0.875rem;
  }

  .site-nav {
    gap: 1rem;
  }
}

@media (max-width: 767px) {
  .header-shell {
    flex-wrap: wrap;
  }

  .nav-toggle {
    display: block;
  }

  .header-center:not(.header-center--open) {
    display: none;
  }
}
</style>
