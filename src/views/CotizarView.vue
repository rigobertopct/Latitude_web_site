<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { publicGet, publicPost, resolvePublicMediaUrl } from '../api/public'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const loading = ref(true)
const submitting = ref(false)
const loadError = ref('')
const catalog = ref(null)

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

onMounted(async () => {
  quoteDateRequested.value = todayIso()
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

async function submitQuote() {
  if (!cart.items.length) {
    await Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agregue al menos un producto desde el catálogo.',
      confirmButtonColor: '#001b48',
    })
    return
  }
  if (!clientEmail.value.trim()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Correo requerido',
      text: 'Indique un correo electrónico válido.',
      confirmButtonColor: '#001b48',
    })
    return
  }
  if ((deliveryAddress.value || '').trim().length < 5) {
    await Swal.fire({
      icon: 'warning',
      title: 'Dirección',
      text: 'La dirección de entrega debe tener al menos 5 caracteres.',
      confirmButtonColor: '#001b48',
    })
    return
  }
  if (!originId.value || !destinationId.value || !quoteDateRequested.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Seleccione origen, destino y fecha.',
      confirmButtonColor: '#001b48',
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
      title: 'Solicitud registrada',
      html: `Su número de cotización público es:<br><strong>${quote.public_number}</strong>`,
      confirmButtonColor: '#001b48',
    })
    cart.clear()
    selectedServiceIds.value = new Set()
    deliveryAddress.value = ''
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo enviar',
      text: msg,
      confirmButtonColor: '#001b48',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page mat">
    <header class="top-bar">
      <RouterLink to="/" class="brand">Latitude</RouterLink>
      <nav class="top-nav">
        <RouterLink to="/productos" class="nav-link">Productos</RouterLink>
      </nav>
    </header>

    <main class="main">
      <h1 class="title">Solicitar cotización</h1>

      <p v-if="loading" class="muted">Cargando formulario…</p>
      <p v-else-if="loadError" class="err">{{ loadError }}</p>

      <template v-else>
        <section class="card md-elevation section">
          <h2 class="section-title">Carrito</h2>
          <p v-if="!cart.items.length" class="muted">
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
                width="48"
                height="48"
              />
              <div v-else class="cart-thumb cart-thumb--empty" aria-hidden="true" />
              <div class="cart-info">
                <span class="cart-name">{{ it.name }}</span>
                <span class="cart-price">{{ money(it.unit_price) }} ×</span>
              </div>
              <input
                class="qty"
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
        </section>

        <section class="card md-elevation section">
          <h2 class="section-title">Servicios adicionales</h2>
          <ul class="svc-list">
            <li v-for="s in services" :key="s.id" class="svc-row">
              <label class="svc-label">
                <span class="svc-check-row">
                  <input
                    type="checkbox"
                    :checked="isServiceChecked(s.id)"
                    @change="toggleService(s.id)"
                  />
                  <span class="svc-name">{{ s.name }}</span>
                </span>
                <span v-if="s.description" class="svc-desc">{{ s.description }}</span>
              </label>
              <span class="svc-price">{{ money(s.price) }}</span>
            </li>
          </ul>
          <p class="subtotal-line">Subtotal servicios: <strong>{{ money(servicesSubtotal) }}</strong></p>
          <p class="total-line">Total estimado: <strong>{{ money(grandTotal) }}</strong></p>
        </section>

        <section class="card md-elevation section">
          <h2 class="section-title">Envío y fecha</h2>
          <div class="field-grid">
            <label class="field">
              <span class="label">Fecha solicitada</span>
              <input v-model="quoteDateRequested" type="date" class="input" required />
            </label>
            <label class="field">
              <span class="label">Origen</span>
              <select v-model="originId" class="input" required>
                <option v-for="o in origins" :key="o.id" :value="o.id">{{ o.name }}</option>
              </select>
            </label>
            <label class="field">
              <span class="label">Destino</span>
              <select v-model="destinationId" class="input" required>
                <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </label>
            <label class="field full">
              <span class="label">Dirección de entrega</span>
              <textarea v-model="deliveryAddress" class="input textarea" rows="3" placeholder="Mínimo 5 caracteres" />
            </label>
          </div>
        </section>

        <section class="card md-elevation section">
          <h2 class="section-title">Sus datos</h2>
          <div class="field-grid">
            <label class="field full">
              <span class="label">Correo electrónico *</span>
              <input v-model="clientEmail" type="email" class="input" autocomplete="email" required />
            </label>
            <label class="field">
              <span class="label">Nombre</span>
              <input v-model="clientName" type="text" class="input" autocomplete="name" />
            </label>
            <label class="field">
              <span class="label">Teléfono</span>
              <input v-model="clientPhone" type="tel" class="input" autocomplete="tel" />
            </label>
          </div>
          <p v-if="user?.uid" class="hint">Sesión iniciada: se enviará su identificador al servidor.</p>
        </section>

        <div class="actions">
          <button type="button" class="btn btn-primary" :disabled="submitting" @click="submitQuote">
            {{ submitting ? 'Enviando…' : 'Enviar solicitud' }}
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.page.mat {
  min-height: 100vh;
  font-family: Roboto, system-ui, -apple-system, sans-serif;
  background: #f5f7fa;
  color: #1a1a1a;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--latitude-deep-blue);
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.brand {
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
  text-decoration: none;
}

.top-nav {
  display: flex;
  gap: 1rem;
}

.top-nav .nav-link {
  color: #fff;
  font-weight: 500;
  text-decoration: none;
  opacity: 0.95;
}

.top-nav .nav-link:hover {
  color: var(--latitude-orange);
}

.main {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--latitude-deep-blue);
}

.muted {
  color: #6b7280;
}

.err {
  color: #b91c1c;
  font-weight: 500;
}

.card {
  background: #fff;
  border-radius: 8px;
}

.md-elevation {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(var(--latitude-navy-rgb), 0.08);
}

.section {
  padding: 1.35rem 1.5rem;
  margin-bottom: 1.25rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--latitude-deep-blue);
}

.inline-link {
  color: var(--latitude-orange);
  font-weight: 500;
}

.cart-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.cart-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.cart-thumb--empty {
  background: #eef2f7;
  border-style: dashed;
}

.cart-name {
  font-weight: 500;
  display: block;
}

.cart-price {
  font-size: 0.85rem;
  color: #6b7280;
}

.qty {
  width: 4rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
}

.link-remove {
  background: none;
  border: none;
  color: var(--latitude-deep-blue);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  font-family: inherit;
}

.subtotal-line,
.total-line {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  color: #374151;
}

.total-line {
  font-size: 1.05rem;
  color: var(--latitude-deep-blue);
}

.svc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.svc-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.svc-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
  font-weight: 500;
}

.svc-check-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.svc-name {
  line-height: 1.3;
}

.svc-desc {
  font-size: 0.85rem;
  font-weight: 400;
  color: #6b7280;
}

.svc-price {
  font-weight: 600;
  color: var(--latitude-orange);
  white-space: nowrap;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.full {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #5c6570;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.input {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.input:focus {
  outline: none;
  border-color: var(--latitude-deep-blue);
  box-shadow: 0 0 0 2px rgba(var(--latitude-navy-rgb), 0.15);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.hint {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.actions {
  margin-top: 0.5rem;
}

.btn {
  font-family: inherit;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--latitude-orange);
  color: #fff;
  box-shadow: 0 2px 4px rgba(var(--latitude-orange-rgb), 0.35);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

@media (max-width: 600px) {
  .cart-row {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
