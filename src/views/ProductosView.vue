<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { publicGet, resolvePublicMediaUrl } from '../api/public'
import { useCartStore } from '../stores/cart'
import PortalChrome from '../components/PortalChrome.vue'
import '../styles/portal.css'

const cart = useCartStore()
const { items, totalItems } = storeToRefs(cart)

const loading = ref(true)
const error = ref('')
const catalog = ref(null)
const searchQuery = ref('')

function money(n) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(Number(n))
}

function qtyFor(productId) {
  const row = items.value.find((i) => i.product_id === productId)
  return row ? Number(row.quantity) : 0
}

const products = computed(() => catalog.value?.products || [])

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
  )
})

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
  })
}
</script>

<template>
  <PortalChrome active="productos">
    <div class="portal-page catalog-page">
      <main class="catalog-main">
        <div class="hero-intro">
          <h1 class="display-title">Catálogo de productos</h1>
          <p class="body-lg">
            Seleccione productos y solicite una cotización en línea. Nuestra red global garantiza precisión en cada milla.
          </p>
        </div>

        <div class="toolbar">
          <div class="filter-pills">
            <button type="button" class="pill pill--active">TODOS</button>
          </div>
          <div class="search-wrap">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="Buscar productos..."
              autocomplete="off"
            />
          </div>
        </div>

        <p v-if="loading" class="portal-muted">Cargando catálogo…</p>
        <p v-else-if="error" class="portal-err">{{ error }}</p>
        <p v-else-if="!filteredProducts.length" class="portal-muted">No hay productos que coincidan con su búsqueda.</p>

        <div v-else class="product-grid">
          <article v-for="(p, idx) in filteredProducts" :key="p.id" class="product-card">
            <div class="product-card__media">
              <img
                v-if="p.image_url"
                :src="resolvePublicMediaUrl(p.image_url)"
                :alt="p.name"
                class="product-card__img"
                loading="lazy"
              />
              <div v-else class="product-card__img product-card__img--empty">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <span v-if="idx === 0 && qtyFor(p.id) > 0" class="product-badge">EN CARRITO</span>
              <span v-else-if="idx === 0" class="product-badge">POPULAR</span>
            </div>
            <div class="product-card__body">
              <div class="product-card__head">
                <h2 class="headline-md product-card__title">{{ p.name }}</h2>
                <span class="material-symbols-outlined product-card__icon">local_shipping</span>
              </div>
              <p class="product-card__desc">{{ p.description || 'Sin descripción.' }}</p>
              <div v-if="qtyFor(p.id) > 0" class="in-cart label-caps">
                <span class="material-symbols-outlined">shopping_cart</span>
                {{ qtyFor(p.id) }} en carrito
              </div>
            </div>
            <div class="product-card__foot">
              <div class="price-row">
                <span class="label-caps price-label">PRECIO DESDE</span>
                <span class="price-value">{{ money(p.unit_price) }}</span>
              </div>
              <button type="button" class="add-btn" @click="onAdd(p)">
                <span class="material-symbols-outlined">add</span>
                Añadir al carrito
              </button>
            </div>
          </article>
        </div>

        <div class="cta-bottom">
          <RouterLink to="/cotizar" class="go-quote-btn">
            <span class="material-symbols-outlined">shopping_cart_checkout</span>
            Ir a cotizar
            <span v-if="totalItems > 0" class="go-quote-badge">{{ totalItems > 99 ? '99+' : totalItems }}</span>
          </RouterLink>
        </div>
      </main>
    </div>
  </PortalChrome>
</template>

<style scoped>
.catalog-page {
  padding-bottom: 2rem;
}

.catalog-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem clamp(1rem, 4vw, 3rem) 2rem;
}

.hero-intro {
  margin-bottom: 2rem;
  padding-left: 1.5rem;
  border-left: 4px solid #0051d5;
}

.hero-intro .body-lg {
  margin: 0.5rem 0 0;
  max-width: 42rem;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.filter-pills {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
}

.pill {
  border: 1px solid #c6c6cd;
  background: #eff4ff;
  color: #45464d;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: default;
  white-space: nowrap;
}

.pill--active {
  background: #0b1c30;
  color: #fff;
  border-color: #0b1c30;
}

.search-wrap {
  position: relative;
  width: 100%;
  max-width: 20rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #76777d;
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #c6c6cd;
  border-radius: 12px;
  background: #fff;
  font-family: inherit;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #0051d5;
  box-shadow: 0 0 0 2px rgba(0, 81, 213, 0.15);
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.product-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #c6c6cd;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 12px 32px rgba(11, 28, 48, 0.12);
  transform: translateY(-2px);
}

.product-card__media {
  position: relative;
  height: 16rem;
  background: #d3e4fe;
  overflow: hidden;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.product-card:hover .product-card__img {
  transform: scale(1.04);
}

.product-card__img--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #565e74;
}

.product-card__img--empty .material-symbols-outlined {
  font-size: 3rem;
}

.product-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #f97316;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.product-card__body {
  padding: 1.5rem;
  flex: 1;
}

.product-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-card__title {
  font-size: 1.25rem;
}

.product-card__icon {
  color: #0051d5;
  flex-shrink: 0;
}

.product-card__desc {
  margin: 0 0 1rem;
  color: #45464d;
  font-size: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.in-cart {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #0051d5;
  font-size: 11px;
}

.in-cart .material-symbols-outlined {
  font-size: 1rem;
}

.product-card__foot {
  padding: 0 1.5rem 1.5rem;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #c6c6cd;
  padding-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.price-label {
  color: #76777d;
}

.price-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 600;
  color: #f97316;
}

.add-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: #f97316;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.add-btn:hover {
  opacity: 0.92;
}

.add-btn:active {
  transform: scale(0.98);
}

.cta-bottom {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}

.go-quote-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 3rem;
  border: 2px solid #0051d5;
  border-radius: 12px;
  background: #fff;
  color: #0051d5;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(0, 81, 213, 0.12);
  transition: background 0.25s, color 0.25s;
}

.go-quote-btn:hover {
  background: #0051d5;
  color: #fff;
}

.go-quote-btn:hover .go-quote-badge {
  background: #fff;
  color: #0051d5;
}

.go-quote-badge {
  background: #0051d5;
  color: #fff;
  font-size: 10px;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
