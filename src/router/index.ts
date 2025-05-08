import { createRouter, createWebHistory } from 'vue-router'
import ChartsView from '@/views/ChartsView.vue'
import CampaignDonationsView from '@/views/CampaignDonationsView.vue'
import TrendingDonationsView from '@/views/TrendingDonationsView.vue'
import VolunteerParticipationsView from '@/views/VolunteerParticipationsView.vue'
import DonorsDistributionView from '@/views/DonorsDistributionView.vue'
import CampaignEfficiencyView from '@/views/CampaignEfficiencyView.vue'

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
    },
    {
      path: '/trending-donations',
      name: 'TrendingDonations',
      component: TrendingDonationsView
    },
    {
      path: '/volunteer-participations',
      name: 'VolunteerParticipations',
      component: VolunteerParticipationsView
    },
    {
      path: '/donors-distribution',
      name: 'DonorsDistribution',
      component: DonorsDistributionView
    },
    {
      path: '/campaign-efficiency',
      name: 'CampaignEfficiency',
      component: CampaignEfficiencyView
    },
  ],
})

export default router
