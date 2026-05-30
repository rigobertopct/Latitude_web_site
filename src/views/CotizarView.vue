<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { publicGet, publicPost, resolvePublicMediaUrl } from '../api/public'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import PortalChrome from '../components/PortalChrome.vue'
import '../styles/portal.css'

const cart = useCartStore()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const loading = ref(true)
const submitting = ref(false)
const loadError = ref('')
const catalog = ref(null)
const currentStep = ref(1)
const acceptedTerms = ref(false)

const clientEmail = ref('')
const clientName = ref('')
const clientPhone = ref('')
const quoteDateRequested = ref('')
const originId = ref('')
const destinationId = ref('')
const deliveryAddress = ref('')
const selectedServiceIds = ref(new Set())

const origins = computed(() => catalog.value?.origins || [])
const destinations = computed(() => catalog.value?.destinations || [])
const services = computed(() => catalog.value?.services || [])

function money(n) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(Number(n))
}

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toggleService(id) {
  const next = new Set(selectedServiceIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedServiceIds.value = next
}

function isServiceChecked(id) {
  return selectedServiceIds.value.has(id)
}

const servicesSubtotal = computed(() => {
  let sum = 0
  for (const s of services.value) {
    if (selectedServiceIds.value.has(s.id)) sum += Number(s.price)
  }
  return sum
})

const grandTotal = computed(() => cart.subtotal + servicesSubtotal.value)

function stepClass(n) {
  if (n === currentStep.value) return 'step-dot step-dot--active'
  if (n < currentStep.value) return 'step-dot step-dot--done'
  return 'step-dot'
}

function stepLabelClass(n) {
  return n === currentStep.value || n < currentStep.value ? 'step-label step-label--active' : 'step-label'
}

onMounted(async () => {
  quoteDateRequested.value = todayIso()
  if (user.value?.email) clientEmail.value = user.value.email
  if (user.value?.displayName) clientName.value = user.value.displayName
  loading.value = true
  loadError.value = ''
  try {
    catalog.value = await publicGet('/api/public/cotizaciones/catalogo')
    if (origins.value.length && !originId.value) originId.value = origins.value[0].id
    if (destinations.value.length && !destinationId.value) destinationId.value = destinations.value[0].id
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

watch(catalog, (c) => {
  if (!c) return
  if (origins.value.length && !originId.value) originId.value = origins.value[0].id
  if (destinations.value.length && !destinationId.value) destinationId.value = destinations.value[0].id
})

watch(user, (u) => {
  if (u?.email && !clientEmail.value) clientEmail.value = u.email
  if (u?.displayName && !clientName.value) clientName.value = u.displayName
})

async function validateStep1() {
  if (!originId.value || !destinationId.value || !quoteDateRequested.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Seleccione origen, destino y fecha.',
      confirmButtonColor: '#0051d5',
    })
    return false
  }
  if ((deliveryAddress.value || '').trim().length < 5) {
    await Swal.fire({
      icon: 'warning',
      title: 'Dirección',
      text: 'La dirección de entrega debe tener al menos 5 caracteres.',
      confirmButtonColor: '#0051d5',
    })
    return false
  }
  return true
}

async function validateStep2() {
  if (!cart.items.length) {
    await Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agregue al menos un producto desde el catálogo.',
      confirmButtonColor: '#0051d5',
    })
    return false
  }
  return true
}

async function goNext() {
  if (currentStep.value === 1 && !(await validateStep1())) return
  if (currentStep.value === 2 && !(await validateStep2())) return
  if (currentStep.value < 3) currentStep.value += 1
}

function goBack() {
  if (currentStep.value > 1) currentStep.value -= 1
}

async function submitQuote() {
  if (!(await validateStep1()) || !(await validateStep2())) {
    currentStep.value = cart.items.length ? (clientEmail.value ? 3 : 2) : 2
    return
  }
  if (!clientEmail.value.trim()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Correo requerido',
      text: 'Indique un correo electrónico válido.',
      confirmButtonColor: '#0051d5',
    })
    currentStep.value = 3
    return
  }
  if (!acceptedTerms.value) {
    await Swal.fire({
      icon: 'info',
      title: 'Términos',
      text: 'Acepte los términos de servicio para continuar.',
      confirmButtonColor: '#0051d5',
    })
    return
  }

  const body = {
    client_email: clientEmail.value.trim(),
    client_name: clientName.value.trim() || null,
    client_phone: clientPhone.value.trim() || null,
    quote_date_requested: quoteDateRequested.value,
    origin_id: originId.value,
    destination_id: destinationId.value,
    delivery_address: deliveryAddress.value.trim(),
    items: cart.items.map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
    })),
    extra_service_ids: Array.from(selectedServiceIds.value),
  }
  const uid = user.value?.uid
  if (uid) body.firebase_uid = uid

  submitting.value = true
  try {
    const quote = await publicPost('/api/public/cotizaciones/solicitar', body)
    await Swal.fire({
      icon: 'success',
      title: '¡Solicitud recibida!',
      html: `Su número de cotización público es:<br><strong>${quote.public_number}</strong>`,
      confirmButtonColor: '#0051d5',
    })
    cart.clear()
    selectedServiceIds.value = new Set()
    deliveryAddress.value = ''
    acceptedTerms.value = false
    currentStep.value = 1
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo enviar',
      text: msg,
      confirmButtonColor: '#0051d5',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <PortalChrome active="cotizar">
    <div class="portal-page quote-page">
      <section class="quote-hero">
        <div class="quote-hero__inner">
          <span class="label-caps quote-kicker">Global Logistics Solution</span>
          <h1 class="display-title">Solicitar cotización</h1>
          <p class="body-lg">
            Gestione sus envíos internacionales con precisión. Complete los detalles para recibir una propuesta formal.
          </p>
        </div>
      </section>

      <section class="quote-body">
        <div class="quote-container">
          <p v-if="loading" class="portal-muted">Cargando formulario…</p>
          <p v-else-if="loadError" class="portal-err">{{ loadError }}</p>

          <template v-else>
            <div class="progress">
              <div class="progress__item">
                <div :class="stepClass(1)">1</div>
                <span :class="stepLabelClass(1)">Ruta</span>
              </div>
              <div class="progress__line" :class="{ 'progress__line--done': currentStep > 1 }"></div>
              <div class="progress__item">
                <div :class="stepClass(2)">2</div>
                <span :class="stepLabelClass(2)">Carga</span>
              </div>
              <div class="progress__line" :class="{ 'progress__line--done': currentStep > 2 }"></div>
              <div class="progress__item">
                <div :class="stepClass(3)">3</div>
                <span :class="stepLabelClass(3)">Contacto</span>
              </div>
            </div>

            <div class="form-shell portal-card">
              <!-- Paso 1: Ruta -->
              <div v-show="currentStep === 1" class="step-panel">
                <div class="field-grid-2">
                  <label class="field">
                    <span class="label-caps field-label">Origen</span>
                    <div class="input-icon-wrap">
                      <span class="material-symbols-outlined input-icon">location_on</span>
                      <select v-model="originId" class="portal-input portal-input--icon" required>
                        <option v-for="o in origins" :key="o.id" :value="o.id">{{ o.name }}</option>
                      </select>
                    </div>
                  </label>
                  <label class="field">
                    <span class="label-caps field-label">Destino</span>
                    <div class="input-icon-wrap">
                      <span class="material-symbols-outlined input-icon">flag</span>
                      <select v-model="destinationId" class="portal-input portal-input--icon" required>
                        <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.name }}</option>
                      </select>
                    </div>
                  </label>
                </div>
                <div class="field-grid-2 mt">
                  <label class="field">
                    <span class="label-caps field-label">Fecha solicitada</span>
                    <input v-model="quoteDateRequested" type="date" class="portal-input" required />
                  </label>
                </div>
                <label class="field mt">
                  <span class="label-caps field-label">Dirección de entrega</span>
                  <textarea
                    v-model="deliveryAddress"
                    class="portal-input textarea"
                    rows="3"
                    placeholder="Mínimo 5 caracteres"
                  />
                </label>
                <div class="step-actions step-actions--end">
                  <button type="button" class="portal-btn-primary" @click="goNext">
                    Siguiente paso
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>

              <!-- Paso 2: Carga -->
              <div v-show="currentStep === 2" class="step-panel">
                <h2 class="headline-md step-title">Productos en carrito</h2>
                <p v-if="!cart.items.length" class="portal-muted">
                  No hay productos.
                  <RouterLink to="/productos" class="inline-link">Ver catálogo</RouterLink>
                </p>
                <ul v-else class="cart-list">
                  <li v-for="it in cart.items" :key="it.product_id" class="cart-row">
                    <img
                      v-if="it.image_url"
                      class="cart-thumb"
                      :src="resolvePublicMediaUrl(it.image_url)"
                      :alt="it.name"
                      width="56"
                      height="56"
                    />
                    <div v-else class="cart-thumb cart-thumb--empty">
                      <span class="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div class="cart-info">
                      <span class="cart-name">{{ it.name }}</span>
                      <span class="cart-price">{{ money(it.unit_price) }} c/u</span>
                    </div>
                    <input
                      class="qty portal-input"
                      type="number"
                      min="1"
                      step="1"
                      :value="it.quantity"
                      @change="cart.setQty(it.product_id, $event.target.value)"
                    />
                    <button type="button" class="link-remove" @click="cart.removeProduct(it.product_id)">Quitar</button>
                  </li>
                </ul>
                <p class="subtotal-line">
                  Subtotal productos: <strong>{{ money(cart.subtotal) }}</strong>
                  · Artículos: <strong>{{ cart.totalItems }}</strong>
                </p>

                <h2 class="headline-md step-title">Servicios adicionales</h2>
                <ul class="svc-list">
                  <li v-for="s in services" :key="s.id" class="svc-row">
                    <label class="svc-label">
                      <input type="checkbox" :checked="isServiceChecked(s.id)" @change="toggleService(s.id)" />
                      <span>
                        <span class="svc-name">{{ s.name }}</span>
                        <span v-if="s.description" class="svc-desc">{{ s.description }}</span>
                      </span>
                    </label>
                    <span class="svc-price">{{ money(s.price) }}</span>
                  </li>
                </ul>
                <p class="total-line">Total estimado: <strong>{{ money(grandTotal) }}</strong></p>

                <div class="step-actions">
                  <button type="button" class="btn-back" @click="goBack">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Atrás
                  </button>
                  <button type="button" class="portal-btn-primary" @click="goNext">
                    Siguiente paso
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>

              <!-- Paso 3: Contacto -->
              <div v-show="currentStep === 3" class="step-panel">
                <div class="field-grid-2">
                  <label class="field">
                    <span class="label-caps field-label">Nombre completo</span>
                    <input v-model="clientName" type="text" class="portal-input" autocomplete="name" />
                  </label>
                  <label class="field">
                    <span class="label-caps field-label">Teléfono de contacto</span>
                    <input v-model="clientPhone" type="tel" class="portal-input" autocomplete="tel" />
                  </label>
                  <label class="field full">
                    <span class="label-caps field-label">Correo electrónico *</span>
                    <input v-model="clientEmail" type="email" class="portal-input" autocomplete="email" required />
                  </label>
                </div>
                <p v-if="user?.uid" class="hint">Sesión iniciada: se vinculará su cuenta al enviar la solicitud.</p>

                <label class="terms">
                  <input v-model="acceptedTerms" type="checkbox" />
                  <span>Acepto los términos de servicio y la política de privacidad de Latitude Transport Services.</span>
                </label>

                <div class="step-actions">
                  <button type="button" class="btn-back" @click="goBack">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Atrás
                  </button>
                  <button
                    type="button"
                    class="portal-btn-primary portal-btn-accent submit-btn"
                    :disabled="submitting"
                    @click="submitQuote"
                  >
                    {{ submitting ? 'Enviando…' : 'Solicitar cotización final' }}
                    <span class="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="trust">
        <div class="trust__inner">
          <h3 class="headline-md">¿Por qué confiar en Latitude?</h3>
          <div class="trust-grid">
            <div class="trust-feature">
              <span class="label-caps trust-kicker">Precision First</span>
              <h4 class="trust-title">Red global conectada en tiempo real</h4>
              <p class="trust-text">
                Seguimiento y coordinación de su carga con el equipo especializado de Latitude en cada etapa del envío.
              </p>
            </div>
            <div class="trust-card portal-card">
              <div class="trust-icon-wrap">
                <span class="material-symbols-outlined">verified_user</span>
              </div>
              <h4 class="headline-md">Seguridad certificada</h4>
              <p class="portal-muted trust-text-sm">
                Procesos documentados, aduanas y transporte con los estándares que exige la exportación internacional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </PortalChrome>
</template>

<style scoped>
.quote-hero {
  background: #e5eeff;
  padding: 2.5rem clamp(1rem, 4vw, 3rem);
}

.quote-hero__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.quote-kicker {
  color: #0051d5;
  display: block;
  margin-bottom: 0.5rem;
}

.quote-body {
  padding: 3rem 1rem 2rem;
}

.quote-container {
  max-width: 56rem;
  margin: 0 auto;
}

.progress {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 0.25rem;
}

.progress__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  min-width: 3.5rem;
}

.step-dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 0.5rem;
  border: 1px solid #c6c6cd;
  background: #dce9ff;
  color: #45464d;
  transition: background 0.3s, color 0.3s;
}

.step-dot--active,
.step-dot--done {
  background: #0051d5;
  color: #fff;
  border-color: #0051d5;
}

.step-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  color: #45464d;
}

.step-label--active {
  color: #0051d5;
}

.progress__line {
  flex: 1;
  height: 2px;
  background: #c6c6cd;
  margin-top: 1.25rem;
  min-width: 1rem;
}

.progress__line--done {
  background: #0051d5;
}

.form-shell {
  padding: 2rem clamp(1rem, 3vw, 3rem);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  color: #45464d;
}

.field-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .field-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

.field.full {
  grid-column: 1 / -1;
}

.mt {
  margin-top: 1.5rem;
}

.input-icon-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #76777d;
  pointer-events: none;
}

.portal-input--icon {
  padding-left: 3rem;
}

.textarea {
  resize: vertical;
  min-height: 5rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.step-actions--end {
  justify-content: flex-end;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.85rem 1.25rem;
  border: none;
  background: transparent;
  color: #45464d;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border-radius: 8px;
}

.btn-back:hover {
  background: #eff4ff;
}

.step-title {
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.inline-link {
  color: #0051d5;
  font-weight: 600;
}

.cart-list {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
}

.cart-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.cart-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #c6c6cd;
}

.cart-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff4ff;
  color: #565e74;
}

.cart-name {
  font-weight: 600;
  display: block;
}

.cart-price {
  font-size: 0.875rem;
  color: #45464d;
}

.qty {
  width: 4.5rem;
  padding: 0.5rem;
}

.link-remove {
  background: none;
  border: none;
  color: #0051d5;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  font-family: inherit;
}

.subtotal-line,
.total-line {
  margin: 1rem 0;
  color: #45464d;
}

.total-line {
  font-size: 1.125rem;
  color: #0b1c30;
}

.svc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.svc-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.svc-label {
  display: flex;
  gap: 0.65rem;
  cursor: pointer;
  align-items: flex-start;
}

.svc-name {
  font-weight: 600;
  display: block;
}

.svc-desc {
  font-size: 0.875rem;
  color: #45464d;
}

.svc-price {
  font-weight: 600;
  color: #f97316;
  white-space: nowrap;
}

.hint {
  margin: 1rem 0 0;
  font-size: 0.875rem;
  color: #45464d;
}

.terms {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #45464d;
  cursor: pointer;
}

.terms input {
  margin-top: 0.2rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #0051d5;
}

.submit-btn {
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25);
}

.trust {
  background: #f8f9ff;
  border-top: 1px solid #c6c6cd;
  padding: 4rem clamp(1rem, 4vw, 3rem);
}

.trust__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.trust-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .trust-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.trust-feature {
  background: #131b2e;
  color: #fff;
  border-radius: 12px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
}

.trust-kicker {
  color: #0051d5;
  display: block;
  margin-bottom: 1rem;
}

.trust-title {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.trust-text {
  margin: 0;
  color: #7c839b;
  max-width: 28rem;
  line-height: 1.6;
}

.trust-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.trust-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.trust-icon-wrap .material-symbols-outlined {
  font-size: 2rem;
  color: #0051d5;
}

.trust-text-sm {
  font-size: 0.875rem;
  line-height: 1.55;
  margin: 0.5rem 0 0;
}

@media (max-width: 600px) {
  .cart-row {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .portal-btn-primary,
  .submit-btn {
    width: 100%;
  }
}
</style>
