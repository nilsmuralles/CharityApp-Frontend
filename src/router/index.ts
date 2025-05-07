import { createRouter, createWebHistory } from 'vue-router'
import ChartsView from '@/views/ChartsView.vue'
import CampaignDonationsView from '@/views/CampaignDonationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Charts',
      component: ChartsView,
    },
    {
      path: '/campaign-donations',
      name: 'CampaignDonations',
      component: CampaignDonationsView
    }
  ],
})

export default router
