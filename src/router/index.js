import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Design2Immersive.vue'),
      meta: { title: 'Latitude Transport Services, Inc.' },
    },
    {
      path: '/productos',
      name: 'productos',
      component: () => import('../views/ProductosView.vue'),
      meta: { title: 'Productos | Latitude' },
    },
    {
      path: '/cotizar',
      name: 'cotizar',
      component: () => import('../views/CotizarView.vue'),
      meta: { title: 'Cotizar | Latitude' },
    },
  ],
})

export default router
