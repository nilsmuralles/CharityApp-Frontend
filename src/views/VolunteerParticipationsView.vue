<script setup>
import { Button, Divider } from 'primevue';
import { ref, onMounted } from 'vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import AmountFilter from '@/components/filters/AmountFilter.vue';
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { filterAlphabetically, filterByAmountRange, getMinAndMaxAmount } from '@/utils/filters'

const minTotalHours = ref()
const maxTotalHours = ref()
const totalHoursRange = ref([])

const chartData = ref({
  rawData: [],
  seriesCampaigns: [],
  seriesVolunteers: [],
  categoriesCampaigns: [],
  categoriesVolunteers: []
})

const stats = ref({
  totalParticipations: 0,
  totalHours: 0,
  topCampaign: { name: '', participations: 0, hours: 0 },
  topVolunteer: { name: '', participations: 0, hours: 0 },
  averageHoursPerParticipation: 0,
  campaignStats: []
})

const getData = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/volunteer-participation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Error al obtener los datos de participación de voluntarios')
    
    const { data } = await response.json()
    chartData.value.rawData = data

    processVolunteerData(data)
  } catch (error) {
    console.error(error)
    alert(error.message || 'Error al cargar los datos')
  }
}

const processVolunteerData = (data) => {
  const campaigns = {}
  const volunteers = {}
  
  data.forEach(item => {
    if (!campaigns[item.campaign]) {
      campaigns[item.campaign] = {
        participations: 0,
        hours: 0,
        volunteers: new Set()
      }
    }
    campaigns[item.campaign].participations += item.participations
    campaigns[item.campaign].hours += item.total_hours
    campaigns[item.campaign].volunteers.add(item.volunteer)

    if (!volunteers[item.volunteer]) {
      volunteers[item.volunteer] = {
        participations: 0,
        hours: 0,
        campaigns: new Set()
      }
    }
    volunteers[item.volunteer].participations += item.participations
    volunteers[item.volunteer].hours += item.total_hours
    volunteers[item.volunteer].campaigns.add(item.campaign)
  })

  const totalParticipations = data.reduce((sum, item) => sum + item.participations, 0)
  const totalHours = data.reduce((sum, item) => sum + item.total_hours, 0)
  const uniqueCampaigns = Object.keys(campaigns)
  const uniqueVolunteers = Object.keys(volunteers)

  const topCampaign = Object.entries(campaigns).reduce((max, [campaign, data]) => 
    data.participations > max.participations ? 
      { name: campaign, participations: data.participations, hours: data.hours } : max,
    { name: '', participations: 0, hours: 0 }
  )

  const topVolunteer = Object.entries(volunteers).reduce((max, [volunteer, data]) => 
    data.hours > max.hours ? 
      { name: volunteer, participations: data.participations, hours: data.hours } : max,
    { name: '', participations: 0, hours: 0 }
  )

  const campaignStats = uniqueCampaigns.map(campaign => ({
    name: campaign,
    participations: campaigns[campaign].participations,
    hours: campaigns[campaign].hours,
    uniqueVolunteers: campaigns[campaign].volunteers.size
  }))

  campaignStats.sort((a, b) => b.participations - a.participations)

  const seriesCampaigns = [
    {
      name: 'Participaciones',
      data: campaignStats.map(item => item.participations)
    },
    {
      name: 'Horas Voluntariado',
      data: campaignStats.map(item => item.hours)
    }
  ]

  const topVolunteers = Object.entries(volunteers)
    .map(([name, data]) => ({
      name,
      participations: data.participations,
      hours: data.hours,
      uniqueCampaigns: data.campaigns.size
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10)

  const seriesVolunteers = [{
    name: 'Horas Voluntariado',
    data: topVolunteers.map(item => item.hours)
  }]

  chartData.value = {
    rawData: data,
    seriesCampaigns,
    seriesVolunteers,
    categoriesCampaigns: campaignStats.map(item => item.name),
    categoriesVolunteers: topVolunteers.map(item => item.name)
  }

  stats.value = {
    totalParticipations,
    totalHours,
    averageHoursPerParticipation: totalHours / totalParticipations,
    topCampaign,
    topVolunteer,
    campaignStats,
    uniqueVolunteersCount: uniqueVolunteers.length,
    uniqueCampaignsCount: uniqueCampaigns.length
  }
}

const initFilters = () => {
  const [minTH, maxTH] = getMinAndMaxAmount(chartData.value.rawData, 'total_hours')

  minTotalHours.value = minTH
  maxTotalHours.value = maxTH
  totalHoursRange.value = [minTH, maxTH]
}

const handleFilterClick = () => {
  const [min, max] = amountRange.value
  const filteredByAmount = filterByAmountRange(filteredByDate, 'total_hours', min, max)
  processVolunteerData(filteredByAmount)
}

const handleSortAlphabetically = () => {
  const sortedAlphabetically = filterAlphabetically(chartData.value.rawData)
  processVolunteerData(sortedAlphabetically)
}

const handleClearClick = async () => {
  await getData()
  initFilters()
}

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
        <label for="money-filter">Rango de horas totales</label>
        <Divider />
        <AmountFilter id="money-filter" v-model="totalHoursRange" :min="minTotalHours" :max="maxTotalHours"/>
      </div>
      <div class="filter">
        <label for="alphabetical-order">Ordenar alfabéticamente</label>
        <Divider />
        <Button label="Ordenar" icon="pi pi-sort-alpha-down" iconPos="right" severity="secondary" raised @click="handleSortAlphabetically"/>
      </div>
    </section>
    <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" @click="handleClearClick"/>
    </aside>
    <section class="content">
      <h1>Participación de Voluntarios</h1>
      
      <section class="data-table">
        <h2>Detalle por Campaña</h2>
        <table>
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Participaciones</th>
              <th>Horas Totales</th>
              <th>Voluntarios Únicos</th>
              <th>Horas/Participación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stats.campaignStats" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.participations }}</td>
              <td>{{ item.hours.toFixed(1) }}</td>
              <td>{{ item.uniqueVolunteers }}</td>
              <td>{{ (item.hours / item.participations).toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="charts">
        <div class="report">
          <h2>Resumen General</h2>
          <div>Total participaciones: <strong>{{ stats.totalParticipations }}</strong></div>
          <div>Total horas voluntariado: <strong>{{ stats.totalHours.toFixed(1) }}</strong></div>
          <div>Promedio horas/participación: <strong>{{ stats.averageHoursPerParticipation.toFixed(1) }}</strong></div>
          <div>Campaña con más participación: <strong>{{ stats.topCampaign.name }} ({{ stats.topCampaign.participations }} participaciones)</strong></div>
          <div>Voluntario más activo: <strong>{{ stats.topVolunteer.name }} ({{ stats.topVolunteer.hours.toFixed(1) }} horas)</strong></div>
          <div>Voluntarios únicos: <strong>{{ stats.uniqueVolunteersCount }}</strong></div>
          <div>Campañas únicas: <strong>{{ stats.uniqueCampaignsCount }}</strong></div>
        </div>

        <BarChart 
          :categories="chartData.categoriesCampaigns" 
          :series="chartData.seriesCampaigns" 
          title="Participación por Campaña"
          :width="600"
          :height="400"
        />

        <ColumnChart 
          :categories="chartData.categoriesVolunteers" 
          :series="chartData.seriesVolunteers" 
          title="Top 10 Voluntarios por Horas"
          :width="600"
          :height="400"
        />

        <PieChart 
          :labels="stats.campaignStats.map(item => `${item.name} (${((item.hours / stats.totalHours) * 100).toFixed(1)}%)`)" 
          :series="stats.campaignStats.map(item => item.hours)" 
          title="Distribución de Horas por Campaña"
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

.filters {
  height: inherit;
  margin-top: 3.3rem;
  background: #343a3f;
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

.report div:hover {
  padding: 0.1rem;
  border-radius: 5px;
  background: #485057;
  transform: scale(1.1);
}

.data-table {
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
</style>
