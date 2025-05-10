<script setup>
import { Button, Divider } from 'primevue';
import 'primeicons/primeicons.css'
import { ref, onMounted } from 'vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DateFilter from '@/components/filters/DateFilter.vue';
import AmountFilter from '@/components/filters/AmountFilter.vue';
import { getMinAndMaxDate, filterByDateRange, getMinAndMaxAmount, filterByAmountRange, filterAlphabetically } from '@/utils/filters'

const dateRangeValue = ref()

const minDonations = ref()
const maxDonations = ref()
const donationsRange = ref([])

const chartData = ref({
  rawData: [],
  seriesDonations: [],
  seriesEngagement: [],
  categories: [],
  activeCampaigns: []
})

const stats = ref({
  totalDonations: 0,
  totalRecognitions: 0,
  totalVolunteers: 0,
  topCampaign: { name: '', donations: 0, volunteers: 0 },
  avgDonationsPerCampaign: 0,
  recognitionRate: 0,
  campaignStats: []
})

const getData = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/campaign-efficiency', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Error al obtener el rendimiento de campañas')
    
    const { data } = await response.json()
    chartData.value.rawData = data

    // Procesar datos para gráficos y estadísticas
    processCampaignData(data)
  } catch (error) {
    console.error(error)
    alert(error.message || 'Error al cargar los datos')
  }
}

const processCampaignData = (data) => {
  const totalDonations = data.reduce((sum, item) => sum + item.total_donations, 0)
  const totalRecognitions = data.reduce((sum, item) => sum + item.recognitions_awarded, 0)
  const totalVolunteers = data.reduce((sum, item) => sum + item.unique_volunteers, 0)
  
  const campaignStats = data.map(item => ({
    name: item.campaign,
    donations: item.total_donations,
    volunteers: item.unique_volunteers,
    participations: item.participations,
    recognitions: item.recognitions_awarded,
    startDate: new Date(item.init_date),
    endDate: new Date(item.end_date),
    durationDays: Math.ceil((new Date(item.end_date) - new Date(item.init_date)) / (1000 * 60 * 60 * 24)),
    donationsPerDay: item.total_donations / Math.ceil((new Date(item.end_date) - new Date(item.init_date)) / (1000 * 60 * 60 * 24))
  }))

  campaignStats.sort((a, b) => b.donations - a.donations)

  const now = new Date()
  const activeCampaigns = campaignStats.filter(c => 
    now >= c.startDate && now <= c.endDate
  )

  const topCampaign = campaignStats.reduce((max, campaign) => 
    campaign.donations > max.donations ? 
      { name: campaign.name, donations: campaign.donations, volunteers: campaign.volunteers } : max,
    { name: '', donations: 0, volunteers: 0 }
  )

  const seriesDonations = [{
    name: 'Donaciones',
    data: campaignStats.map(item => item.donations)
  }]

  const seriesEngagement = [
    {
      name: 'Voluntarios',
      data: campaignStats.map(item => item.volunteers)
    },
    {
      name: 'Reconocimientos',
      data: campaignStats.map(item => item.recognitions)
    }
  ]

  chartData.value = {
    rawData: data,
    seriesDonations,
    seriesEngagement,
    categories: campaignStats.map(item => item.name),
    activeCampaigns
  }

  stats.value = {
    totalDonations,
    totalRecognitions,
    totalVolunteers,
    topCampaign,
    avgDonationsPerCampaign: totalDonations / campaignStats.length,
    recognitionRate: totalRecognitions > 0 ? (totalRecognitions / totalVolunteers * 100).toFixed(1) : 0,
    campaignStats,
    totalCampaigns: campaignStats.length,
    activeCampaignsCount: activeCampaigns.length
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const initFilters = () => {
  const [minDate, maxDate] = getMinAndMaxDate(chartData.value.rawData, 'end_date')
  const [min, max] = getMinAndMaxAmount(chartData.value.rawData, 'total_donations')
  
  minDonations.value = min
  maxDonations.value = max
  donationsRange.value = [min, max]
  dateRangeValue.value.startDate = minDate
  dateRangeValue.value.endDate = maxDate
}

const handleFilterClick = () => {
  const start = dateRangeValue.value?.startDate
  const end = dateRangeValue.value?.endDate
  const [min, max] = donationsRange.value

  const filteredByDate = filterByDateRange(chartData.value.rawData, 'end_date', start, end)
  const filteredByAmount = filterByAmountRange(filteredByDate, 'total_donations', min, max)
  processCampaignData(filteredByAmount)
}

const handleSortAlphabetically = () => {
  const sortedAlphabetically = filterAlphabetically(chartData.value.rawData, false)
  processCampaignData(sortedAlphabetically)
}

const handleSortAlphabeticallyInverse = () => {
  const sortedAlphabetically = filterAlphabetically(chartData.value.rawData, true)
  processCampaignData(sortedAlphabetically)
}

const handleClearClick = (async () => {
  await getData()
  initFilters()
})

onMounted(async () => {
  await getData()
  initFilters()
})
</script>

<template>
  <main class="container">
    <aside class="filters">
    <Button label="Filter" class="btn-filter" icon="pi pi-filter" iconPos="right" @click="handleFilterClick"/>
    <section class="filter-sction">
      <div class="filter">
        <label for="date-filter">Rango de fecha</label>
        <Divider />
        <DateFilter id="date-filter" ref="dateRangeValue"/>
      </div>
      <div class="filter">
        <label for="money-filter">Rango de valor monetario</label>
        <Divider />
        <AmountFilter id="money-filter" :unity="'$'" v-model="donationsRange" :min="minDonations" :max="maxDonations"/>
      </div>
      <div class="filter">
        <label for="alphabetical-order">Ordenar alfabéticamente (A-Z)</label>
        <Divider />
        <Button label="Ordenar" icon="pi pi-sort-alpha-down" iconPos="right" severity="secondary" raised @click="handleSortAlphabetically"/>
      </div>
      <div class="filter">
        <label for="alphabetical-order-reverse">Ordenar alfabéticamente (Z-A)</label>
        <Divider />
        <Button label="Ordenar" icon="pi pi-sort-alpha-down-alt" iconPos="right" severity="secondary" raised @click="handleSortAlphabeticallyInverse"/>
      </div>
    </section>
    <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" @click="handleClearClick"/>
    </aside>
    <section class="content">
      <h1>Rendimiento de Campañas</h1>
      
      <section class="data-table">
        <h2>Detalle por Campaña</h2>
        <table>
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Duración (días)</th>
              <th>Donaciones</th>
              <th>Donaciones/Día</th>
              <th>Voluntarios</th>
              <th>Reconocimientos</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stats.campaignStats" :key="index" 
                :class="{ 'active-campaign': new Date() >= item.startDate && new Date() <= item.endDate }">
              <td>{{ item.name }}</td>
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>{{ item.durationDays }}</td>
              <td>${{ item.donations.toLocaleString() }}</td>
              <td>${{ item.donationsPerDay.toFixed(2) }}</td>
              <td>{{ item.volunteers }}</td>
              <td>{{ item.recognitions }}</td>
              <td>
                <span v-if="new Date() < item.startDate" class="status planned">Planificada</span>
                <span v-else-if="new Date() > item.endDate" class="status completed">Finalizada</span>
                <span v-else class="status active">Activa</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="charts">
        <div class="report">
          <h2>Resumen General</h2>
          <div>Total donaciones: <strong>${{ stats.totalDonations.toLocaleString() }}</strong></div>
          <div>Total voluntarios: <strong>{{ stats.totalVolunteers }}</strong></div>
          <div>Total reconocimientos: <strong>{{ stats.totalRecognitions }}</strong></div>
          <div>Campaña con más donaciones: <strong>{{ stats.topCampaign.name }} (${{ stats.topCampaign.donations.toLocaleString() }})</strong></div>
          <div>Promedio donaciones/campaña: <strong>${{ stats.avgDonationsPerCampaign.toFixed(2) }}</strong></div>
          <div>Tasa de reconocimiento: <strong>{{ stats.recognitionRate }}%</strong></div>
          <div>Campañas activas: <strong>{{ stats.activeCampaignsCount }}</strong></div>
        </div>

        <BarChart 
          :categories="chartData.categories" 
          :series="chartData.seriesDonations" 
          title="Donaciones por Campaña"
          :width="600"
          :height="400"
        />

        <ColumnChart 
          :categories="chartData.categories" 
          :series="chartData.seriesEngagement" 
          title="Participación por Campaña"
          :width="600"
          :height="400"
        />

        <PieChart 
          :labels="stats.campaignStats.slice(0, 5).map(item => `${item.name} (${((item.donations / stats.totalDonations) * 100).toFixed(1)}%)`)" 
          :series="stats.campaignStats.slice(0, 5).map(item => item.donations)" 
          title="Top 5 Campañas por Donaciones"
          :width="600"
          :height="400"
        />
      </section>
    </section>
  </main>
</template>

<style scoped>
.container {
  height: 100dvh;
  width: 100%;
  display: flex;
  gap: 2rem;
  justify-content: center;
  overflow: hidden;
}

.content {
  margin-top: 4.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.charts {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 710px;
  flex-direction: column;
  overflow-y: scroll;
}

.charts strong {
  font-weight: 500;
}

.report {
  width: 650px;
  height: auto;
  background: #343a3f;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem;
  margin: 1rem;
}

.filters {
  height: inherit;
  margin-top: 3.3rem;
  background: #343a3f;
}

.report div:hover {
  padding: 0.1rem;
  border-radius: 5px;
  background: #485057;
  transform: scale(1.1);
}

.data-table {
  width: 60dvw;
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 2rem;
  margin-top: 0.5rem;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  overflow: hidden;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #343a3f;
  color: white;
  position: sticky;
  top: 0;
}

tr:hover {
  background-color: #485057;
}

.active-campaign {
  background-color: rgba(40, 167, 69, 0.1);
  border-left: 4px solid #28a745;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
}

.status.planned {
  background-color: #ffc107;
  color: #212529;
}

.status.active {
  background-color: #28a745;
  color: white;
}

.status.completed {
  background-color: #6c757d;
  color: white;
}
</style>
