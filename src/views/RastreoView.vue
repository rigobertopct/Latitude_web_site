<script setup>
import { ref } from 'vue'
import PortalChrome from '../components/PortalChrome.vue'
import '../styles/portal.css'

const DEFAULT_ID = 'LAT-9842-XQ'
const trackingInput = ref(DEFAULT_ID)
const showResults = ref(true)
const searchFocused = ref(false)

const demoShipment = {
  id: 'LAT-9842-XQ',
  mode: 'CARGA MARÍTIMA',
  modeIcon: 'directions_boat',
  status: 'En tránsito',
  location: 'Puerto de Rotterdam, NL',
  eta: '14 de Octubre, 2024',
  timeline: [
    {
      state: 'done',
      icon: 'check',
      title: 'Recolección de Mercancía',
      detail: 'Centro Logístico Shanghái North, CN',
      time: '28 Sep, 10:20 AM',
    },
    {
      state: 'done',
      icon: 'check',
      title: 'Trámites Aduanales (Exportación)',
      detail: 'Puerto de Shanghái, Terminal de Contenedores',
      time: '30 Sep, 14:15 PM',
    },
    {
      state: 'active',
      icon: 'sailing',
      title: 'En Tránsito Internacional',
      detail: 'Océano Atlántico Norte • Buque: MSC LAUREN',
      time: 'En curso',
      telemetry: {
        title: 'ÚLTIMA ACTUALIZACIÓN TELEMÉTRICA',
        text: 'Navegando a 18.4 nudos. Rumbo NE 45°. Condiciones marítimas estables.',
      },
    },
    {
      state: 'pending',
      icon: 'anchor',
      title: 'Llegada a Puerto de Destino',
      detail: 'Puerto de Veracruz, MX • Terminal de Carga',
      time: 'Programado: 10 Oct',
    },
    {
      state: 'pending',
      icon: 'home_pin',
      title: 'Entrega en Destino Final',
      detail: 'Instalaciones del Cliente, CDMX, MX',
      time: 'Programado: 14 Oct',
      last: true,
    },
  ],
}

const displayed = ref({ ...demoShipment })

function trackNow() {
  const id = trackingInput.value.trim().toUpperCase() || DEFAULT_ID
  trackingInput.value = id
  if (id === DEFAULT_ID) {
    displayed.value = { ...demoShipment, id }
    showResults.value = true
    return
  }
  displayed.value = {
    ...demoShipment,
    id,
    status: 'Sin información',
    location: '—',
    eta: '—',
    timeline: [
      {
        state: 'pending',
        icon: 'search_off',
        title: 'Guía no encontrada',
        detail: 'Verifique el número de rastreo o contacte a soporte.',
        time: '—',
        last: true,
      },
    ],
  }
  showResults.value = true
}
</script>

<template>
  <PortalChrome active="rastreo">
    <div class="portal-page track-page">
      <section class="track-hero">
        <div class="track-hero__decor" aria-hidden="true">
          <span class="material-symbols-outlined">public</span>
        </div>
        <div class="track-hero__inner">
          <span class="label-caps track-kicker">MONITOREO GLOBAL</span>
          <h1 class="display-title">Rastreo de Envíos</h1>
          <p class="body-lg track-lead">
            Consulte el estado de su carga en tiempo real con precisión milimétrica desde cualquier lugar del mundo.
          </p>
          <div
            class="track-search"
            :class="{ 'track-search--focus': searchFocused }"
          >
            <div class="track-search__field">
              <span class="material-symbols-outlined track-search__icon">distance</span>
              <input
                v-model="trackingInput"
                type="text"
                class="track-search__input"
                placeholder="Ej. LAT-9842-XQ"
                @focus="searchFocused = true"
                @blur="searchFocused = false"
                @keyup.enter="trackNow"
              />
            </div>
            <button type="button" class="track-search__btn" @click="trackNow">
              Rastrear ahora
            </button>
          </div>
        </div>
      </section>

      <section v-if="showResults" class="track-content">
        <div class="track-summary portal-card">
          <div class="track-summary__head">
            <div>
              <p class="label-caps muted-label">GUÍA DE RASTREO</p>
              <h2 class="headline-md">{{ displayed.id }}</h2>
            </div>
            <div class="mode-badge">
              <span class="material-symbols-outlined mode-badge__icon">{{ displayed.modeIcon }}</span>
              <span class="label-caps mode-badge__text">{{ displayed.mode }}</span>
            </div>
          </div>
          <div class="stats-row">
            <div class="stat">
              <div class="stat__icon stat__icon--primary">
                <span class="material-symbols-outlined">sailing</span>
              </div>
              <div>
                <p class="label-caps stat__label stat__label--accent">ESTADO ACTUAL</p>
                <p class="stat__value">{{ displayed.status }}</p>
              </div>
            </div>
            <div class="stat">
              <div class="stat__icon">
                <span class="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <p class="label-caps stat__label">UBICACIÓN</p>
                <p class="stat__value">{{ displayed.location }}</p>
              </div>
            </div>
            <div class="stat">
              <div class="stat__icon">
                <span class="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p class="label-caps stat__label">ENTREGA ESTIMADA</p>
                <p class="stat__value">{{ displayed.eta }}</p>
              </div>
            </div>
          </div>
          <button type="button" class="manifest-btn">
            Ver detalles del manifiesto completo
          </button>
        </div>

        <div class="timeline-card portal-card">
          <div class="timeline-head">
            <h3 class="headline-md">Historial de Envío</h3>
            <span class="timeline-note">Horarios en hora local</span>
          </div>
          <div class="timeline">
            <div
              v-for="(step, i) in displayed.timeline"
              :key="i"
              class="timeline-step"
              :class="[
                `timeline-step--${step.state}`,
                { 'timeline-step--last': step.last },
              ]"
            >
              <span class="timeline-step__dot">
                <span class="material-symbols-outlined">{{ step.icon }}</span>
              </span>
              <div class="timeline-step__body">
                <div class="timeline-step__row">
                  <div>
                    <p class="timeline-step__title">{{ step.title }}</p>
                    <p class="timeline-step__detail">{{ step.detail }}</p>
                    <div v-if="step.telemetry" class="telemetry">
                      <p class="telemetry__title">{{ step.telemetry.title }}</p>
                      <p class="telemetry__text">"{{ step.telemetry.text }}"</p>
                    </div>
                  </div>
                  <p
                    class="timeline-step__time"
                    :class="{ 'timeline-step__time--active': step.state === 'active' }"
                  >
                    {{ step.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="track-cta">
        <div class="track-cta__inner">
          <div class="track-cta__text">
            <h2 class="headline-md track-cta__title">¿Desea recibir actualizaciones?</h2>
            <p class="track-cta__desc">
              Suscríbase para recibir notificaciones automáticas vía WhatsApp o correo sobre el estado de su envío.
            </p>
          </div>
          <div class="track-cta__actions">
            <a
              href="https://wa.me/13057759737"
              target="_blank"
              rel="noopener noreferrer"
              class="track-cta__btn track-cta__btn--primary"
            >
              Configurar Alertas
            </a>
            <button type="button" class="track-cta__btn track-cta__btn--outline">
              Descargar App
            </button>
          </div>
        </div>
      </section>
    </div>
  </PortalChrome>
</template>

<style scoped>
.track-page {
  padding-bottom: 0;
}

.track-hero {
  position: relative;
  padding: 4rem clamp(1rem, 4vw, 3rem) 2.5rem;
  background: #f8f9ff;
  overflow: hidden;
  text-align: center;
}

.track-hero__decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 33%;
  height: 100%;
  opacity: 0.05;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-hero__decor .material-symbols-outlined {
  font-size: 18rem;
  font-weight: 100;
}

.track-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
}

.track-kicker {
  color: #0051d5;
  display: block;
  margin-bottom: 0.5rem;
}

.track-lead {
  max-width: 42rem;
  margin: 0 auto 2rem;
}

.track-search {
  max-width: 36rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #c6c6cd;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.track-search--focus {
  border-color: #0051d5;
  box-shadow: 0 4px 12px rgba(0, 81, 213, 0.12);
}

@media (min-width: 640px) {
  .track-search {
    flex-direction: row;
    align-items: stretch;
  }
}

.track-search__field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
}

.track-search__icon {
  color: #0051d5;
  opacity: 0.6;
}

.track-search__input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
  padding: 0.75rem 0;
  outline: none;
}

.track-search__btn {
  border: none;
  background: #f97316;
  color: #fff;
  font-weight: 600;
  font-family: inherit;
  font-size: 1rem;
  padding: 0.85rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.track-search__btn:hover {
  background: #ea580c;
}

.track-content {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem clamp(1rem, 4vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.track-summary {
  padding: 2rem;
}

.track-summary__head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #c6c6cd;
}

@media (min-width: 640px) {
  .track-summary__head {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.muted-label {
  color: #45464d;
  margin: 0 0 0.25rem;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #dce9ff;
  color: #0051d5;
  padding: 0.5rem 1rem;
  border-radius: 999px;
}

.mode-badge__icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.mode-badge__text {
  font-size: 11px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #e5eeff;
  color: #45464d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat__icon--primary {
  background: #316bf3;
  color: #fff;
}

.stat__label {
  font-size: 10px;
  color: #45464d;
  margin: 0 0 0.15rem;
}

.stat__label--accent {
  color: #0051d5;
}

.stat__value {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}

.manifest-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem;
  border: 1px solid #0051d5;
  background: transparent;
  color: #0051d5;
  border-radius: 8px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}

.manifest-btn:hover {
  background: #eff4ff;
}

.timeline-card {
  padding: 2rem;
}

.timeline-head {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .timeline-head {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.timeline-note {
  font-size: 0.875rem;
  color: #45464d;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 0.5rem;
}

.timeline-step {
  position: relative;
  padding-left: 3rem;
}

.timeline-step:not(.timeline-step--last)::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 2rem;
  bottom: -2rem;
  width: 2px;
  background: #c6c6cd;
}

.timeline-step--done:not(.timeline-step--last)::before,
.timeline-step--active:not(.timeline-step--last)::before {
  background: #0051d5;
}

.timeline-step--pending {
  opacity: 0.65;
}

.timeline-step__dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background: #fff;
  border: 2px solid #c6c6cd;
  color: #76777d;
}

.timeline-step--done .timeline-step__dot {
  border-color: #0051d5;
  color: #0051d5;
}

.timeline-step--active .timeline-step__dot {
  background: #0051d5;
  border-color: #0051d5;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(49, 107, 243, 0.15);
}

.timeline-step--active .timeline-step__dot .material-symbols-outlined {
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}

.timeline-step__row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .timeline-step__row {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.timeline-step__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.timeline-step--active .timeline-step__title {
  color: #0051d5;
}

.timeline-step__detail {
  margin: 0.25rem 0 0;
  color: #45464d;
  font-size: 1rem;
}

.timeline-step__time {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #45464d;
  background: #e5eeff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  align-self: flex-start;
  white-space: nowrap;
}

.timeline-step__time--active {
  color: #0051d5;
  background: rgba(0, 81, 213, 0.1);
  border: 1px solid rgba(0, 81, 213, 0.2);
}

.telemetry {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #dce9ff;
  border-left: 4px solid #0051d5;
  border-radius: 8px;
  max-width: 28rem;
}

.telemetry__title {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0051d5;
}

.telemetry__text {
  margin: 0;
  font-size: 0.75rem;
  font-style: italic;
  color: #0b1c30;
}

.track-cta {
  padding: 4rem clamp(1rem, 4vw, 3rem);
}

.track-cta__inner {
  max-width: 1280px;
  margin: 0 auto;
  background: #131b2e;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .track-cta__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.track-cta__inner::after {
  content: '';
  position: absolute;
  top: -5rem;
  right: -5rem;
  width: 16rem;
  height: 16rem;
  background: #0051d5;
  opacity: 0.1;
  border-radius: 50%;
  filter: blur(40px);
}

.track-cta__text {
  position: relative;
  z-index: 1;
  text-align: center;
}

@media (min-width: 768px) {
  .track-cta__text {
    text-align: left;
  }
}

.track-cta__title {
  color: #fff;
  margin: 0 0 0.5rem;
}

.track-cta__desc {
  margin: 0;
  color: #7c839b;
  max-width: 28rem;
  line-height: 1.55;
}

.track-cta__actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 640px) {
  .track-cta__actions {
    flex-direction: row;
    width: auto;
  }
}

.track-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: inherit;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.track-cta__btn--primary {
  background: #316bf3;
  color: #fff;
}

.track-cta__btn--primary:hover {
  background: #0051d5;
}

.track-cta__btn--outline {
  background: transparent;
  border: 1px solid #7c839b;
  color: #7c839b;
}

.track-cta__btn--outline:hover {
  color: #fff;
  border-color: #fff;
}
</style>
