import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * @typedef {{ product_id: string, name: string, unit_price: number, quantity: number, image_url?: string | null }} CartItem
 */

export const useCartStore = defineStore('cart', () => {
  /** @type {import('vue').Ref<CartItem[]>} */
  const items = ref([])

  const subtotal = computed(() =>
    items.value.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0)
  )

  const totalItems = computed(() =>
    items.value.reduce((sum, it) => sum + Number(it.quantity), 0)
  )

  /**
   * @param {{ id: string, name: string, unit_price: number | string, image_url?: string | null }} product
   */
  function addProduct(product) {
    const unit = Number(product.unit_price)
    const existing = items.value.find((i) => i.product_id === product.id)
    if (existing) {
      existing.quantity += 1
      if (product.image_url) existing.image_url = product.image_url
      return
    }
    items.value.push({
      product_id: product.id,
      name: product.name,
      unit_price: unit,
      quantity: 1,
      image_url: product.image_url || null,
    })
  }

  function setQty(productId, qty) {
    const q = Number(qty)
    if (!Number.isFinite(q) || q <= 0) {
      removeProduct(productId)
      return
    }
    const row = items.value.find((i) => i.product_id === productId)
    if (row) row.quantity = q
  }

  function removeProduct(productId) {
    items.value = items.value.filter((i) => i.product_id !== productId)
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    subtotal,
    totalItems,
    addProduct,
    setQty,
    removeProduct,
    clear,
  }
})
