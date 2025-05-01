import { createRouter, createWebHistory } from 'vue-router'
import ChartsView from '@/views/ChartsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Charts',
      component: ChartsView,
    }
  ],
})

export default router
