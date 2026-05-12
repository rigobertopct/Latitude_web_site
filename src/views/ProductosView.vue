<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { publicGet, resolvePublicMediaUrl } from '../api/public'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const { items, totalItems } = storeToRefs(cart)

const loading = ref(true)
const error = ref('')
const catalog = ref(null)

function money(n) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(Number(n))
}

function qtyFor(productId) {
  const row = items.value.find((i) => i.product_id === productId)
  return row ? Number(row.quantity) : 0
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    catalog.value = await publicGet('/api/public/cotizaciones/catalogo')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

async function onAdd(p) {
  cart.addProduct(p)
  const n = qtyFor(p.id)
  await Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Producto agregado',
    text: `${p.name} · ${n} ${n === 1 ? 'unidad' : 'unidades'} en el carrito`,
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
  })
}
</script>

<template>
  <div class="page mat">
    <header class="top-bar">
      <RouterLink to="/" class="brand">Latitude</RouterLink>
      <nav class="top-nav">
        <RouterLink
          v-if="totalItems > 0"
          to="/cotizar"
          class="nav-cart"
          :aria-label="`Ver carrito, ${totalItems} productos`"
        >
          <span class="nav-cart__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.2 14h9.45c.75 0 1.41-.41 1.75-1.03l3.24-6.14a1 1 0 0 0-.08-1.02l-1.1-1.66A1 1 0 0 0 19.6 4H6.21L5.27 2H2v2h2l3.6 7.59-1.35 2.44C5.52 15.37 6.48 17 8 17h12v-2H8.42a.25.25 0 0 1-.22-.37L8.63 14h-.43zM6.38 6h12.13l.91 1H7.42L6.38 6z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span class="nav-cart__text">
            <span class="nav-cart__title">Carrito</span>
            <span class="nav-cart__sub">{{ totalItems }} {{ totalItems === 1 ? 'producto' : 'productos' }}</span>
          </span>
          <span class="nav-cart__badge">{{ totalItems > 99 ? '99+' : totalItems }}</span>
        </RouterLink>
        <RouterLink to="/cotizar" class="link-accent">Cotizar</RouterLink>
      </nav>
    </header>

    <main class="main">
      <h1 class="title">Catálogo de productos</h1>
      <p class="lead">Seleccione productos y solicite una cotización en línea.</p>

      <p v-if="loading" class="muted">Cargando catálogo…</p>
      <p v-else-if="error" class="err">{{ error }}</p>

      <div v-else class="grid">
        <article v-for="p in catalog?.products || []" :key="p.id" class="product-card">
          <div class="product-card__media">
            <img
              v-if="p.image_url"
              :src="resolvePublicMediaUrl(p.image_url)"
              :alt="p.name"
              class="product-card__img"
              loading="lazy"
            />
            <div v-else class="product-card__img product-card__img--placeholder" aria-hidden="true">
              <span class="product-card__placeholder-icon">📦</span>
            </div>
          </div>
          <div class="product-card__content">
            <h2 class="product-card__title">{{ p.name }}</h2>
            <p class="product-card__desc">{{ p.description || 'Sin descripción.' }}</p>
          </div>
          <div class="product-card__meta">
            <span class="product-card__price-label">Precio</span>
            <span class="product-card__price">{{ money(p.unit_price) }}</span>
          </div>
          <div class="product-card__actions">
            <button type="button" class="md-filled-btn" @click="onAdd(p)">
              <span class="md-filled-btn__icon" aria-hidden="true">+</span>
              Añadir al carrito
            </button>
            <div
              v-if="qtyFor(p.id) > 0"
              class="qty-chip"
              role="status"
              aria-live="polite"
            >
              <span class="qty-chip__number">{{ qtyFor(p.id) }}</span>
              <span class="qty-chip__text">
                {{ qtyFor(p.id) === 1 ? 'unidad en tu carrito' : 'unidades en tu carrito' }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div class="cta-row">
        <RouterLink to="/cotizar" class="md-outline-btn">Ir a cotizar</RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Material 3–inspired surfaces (Roboto, 12dp cards, filled button, chips) */
.page.mat {
  min-height: 100vh;
  font-family: Roboto, system-ui, -apple-system, sans-serif;
  background: #f7f9fc;
  color: #1c1b1f;
  letter-spacing: 0.01em;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  background: var(--latitude-deep-blue);
  color: #fff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.12);
}

.brand {
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: 0.02em;
  color: #fff;
  text-decoration: none;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-cart {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.65rem 0.45rem 0.55rem;
  background: #fffbff;
  color: #1c1b1f;
  border-radius: 20px;
  text-decoration: none;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
  position: relative;
  max-width: min(280px, 85vw);
}

.nav-cart:hover {
  background: #fff;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.14),
    0 6px 16px rgba(var(--latitude-navy-rgb), 0.15);
  transform: translateY(-1px);
}

.nav-cart:focus-visible {
  outline: 2px solid var(--latitude-orange);
  outline-offset: 2px;
}

.nav-cart__icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e8eef5;
  color: var(--latitude-deep-blue);
  flex-shrink: 0;
}

.nav-cart__icon svg {
  width: 22px;
  height: 22px;
}

.nav-cart__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  min-width: 0;
  padding-right: 0.25rem;
}

.nav-cart__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--latitude-deep-blue);
  line-height: 1.2;
}

.nav-cart__sub {
  font-size: 0.75rem;
  font-weight: 400;
  color: #49454f;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.nav-cart__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #fff;
  background: var(--latitude-orange);
  border-radius: 999px;
  border: 2px solid var(--latitude-deep-blue);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.top-nav .link-accent {
  color: var(--latitude-amber);
  font-weight: 500;
  font-size: 0.9375rem;
  text-decoration: none;
  padding: 0.5rem 0.65rem;
  border-radius: 20px;
  transition: background 0.2s ease;
}

.top-nav .link-accent:hover {
  background: rgba(255, 255, 255, 0.12);
  text-decoration: none;
}

.main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.title {
  margin: 0 0 0.35rem;
  font-size: 1.75rem;
  font-weight: 500;
  color: #1c1b1f;
  letter-spacing: 0;
}

.lead {
  margin: 0 0 1.75rem;
  color: #49454f;
  font-size: 0.9375rem;
  line-height: 1.5;
  font-weight: 400;
  max-width: 42rem;
}

.muted {
  color: #49454f;
  font-size: 0.9375rem;
}

.err {
  color: #b3261e;
  font-weight: 500;
  font-size: 0.9375rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card__media {
  aspect-ratio: 4 / 3;
  background: linear-gradient(145deg, #e8eef5 0%, #dce4ee 100%);
  overflow: hidden;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-card__img--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  background: linear-gradient(145deg, #e8eef5 0%, #dce4ee 100%);
}

.product-card__placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.35;
}

.product-card {
  background: #fffbff;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e3e8ef;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(var(--latitude-navy-rgb), 0.06);
  transition:
    box-shadow 0.25s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.product-card:hover {
  border-color: #c5d0e0;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(var(--latitude-navy-rgb), 0.1);
  transform: translateY(-2px);
}

.product-card__content {
  padding: 1.25rem 1.25rem 1rem;
  flex: 1;
}

.product-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.35;
  color: #1c1b1f;
}

.product-card__desc {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #49454f;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(180deg, #f4f6fa 0%, #eef2f7 100%);
  border-top: 1px solid #e3e8ef;
}

.product-card__price-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--latitude-deep-blue);
}

.product-card__price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e65100;
  letter-spacing: -0.02em;
}

.product-card__actions {
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.md-filled-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 40px;
  padding: 0 1.5rem;
  border: none;
  border-radius: 20px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #fff;
  background: var(--latitude-orange);
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(var(--latitude-orange-rgb), 0.35);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.md-filled-btn:hover {
  background: #f57c00;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.18),
    0 4px 12px rgba(var(--latitude-orange-rgb), 0.35);
}

.md-filled-btn:active {
  transform: scale(0.98);
}

.md-filled-btn:focus-visible {
  outline: 2px solid var(--latitude-deep-blue);
  outline-offset: 2px;
}

.md-filled-btn__icon {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1;
  opacity: 0.95;
}

.qty-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.75rem;
  background: #e8f0fe;
  border-radius: 12px;
  border: 1px solid #c5d8f0;
}

.qty-chip__number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.4rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--latitude-deep-blue);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(var(--latitude-navy-rgb), 0.12);
}

.qty-chip__text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1c1b1f;
  line-height: 1.3;
  flex: 1;
}

.md-outline-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 1.5rem;
  border-radius: 20px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--latitude-deep-blue);
  background: transparent;
  border: 1px solid #747775;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.md-outline-btn:hover {
  background: rgba(var(--latitude-navy-rgb), 0.06);
  border-color: var(--latitude-deep-blue);
}

.cta-row {
  margin-top: 2.25rem;
}
</style>
