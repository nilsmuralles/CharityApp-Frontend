<script setup>
import { Button, Divider } from 'primevue';
import 'primeicons/primeicons.css'
import ColumnChart from '@/components/charts/ColumnChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import LineChart from '@/components/charts/LineChart.vue';
import DateFilter from '@/components/filters/DateFilter.vue';
import AmountFilter from '@/components/filters/AmountFilter.vue';
import { getMinAndMaxAmount, filterByAmountRange, getMinAndMaxDate, filterByDateRange } from '@/utils/filters';
import { ref, onMounted } from 'vue';

const dateRangeValue = ref()

const minAmount = ref()
const maxAmount = ref()
const amountRange = ref([])

const chartData = ref({
    rawData: [],
    seriesByMethod: [],
    seriesByMonth: [],
    categories: []
})

const stats = ref({
    totalDonations: 0,
    averagePerMonth: 0,
    topMonth: { month: '', total: 0 },
    topMethod: { method: '', total: 0 },
    methodPercentages: []
})

const getData = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/trending-donations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) throw new Error('Error al obtener las tendencias de donaciones')
        const { data } = await response.json()
        chartData.value.rawData = data
        processDonationData(data)
    } catch (error) {
        console.error(error)
        alert(error.message || 'Error al cargar los datos')
    }
}

const processDonationData = (data) => {
    const total = data.reduce((sum, item) => sum + item.total_donations, 0)
    const uniqueMonths = [...new Set(data.map(item => item.month))].sort()
    const methods = [...new Set(data.map(item => item.pay_method))]

    const donationsByMonth = {}
    data.forEach(item => {
        if (!donationsByMonth[item.month]) {
            donationsByMonth[item.month] = {
                total: 0,
                donors: 0,
                methods: {}
            }
        }
        donationsByMonth[item.month].total += item.total_donations
        donationsByMonth[item.month].donors += item.unique_donors
        donationsByMonth[item.month].methods[item.pay_method] =
            (donationsByMonth[item.month].methods[item.pay_method] || 0) + item.total_donations
    })

    const donationsByMethod = {}
    data.forEach(item => {
        if (!donationsByMethod[item.pay_method]) {
            donationsByMethod[item.pay_method] = 0
        }
        donationsByMethod[item.pay_method] += item.total_donations
    })

    const lineSeries = [{
        name: 'Donaciones por mes',
        data: uniqueMonths.map(month => donationsByMonth[month].total)
    }]

    const columnSeries = methods.map(method => ({
        name: method,
        data: uniqueMonths.map(month => {
            return donationsByMonth[month].methods[method] || 0
        })
    }))

    const methodPercentages = Object.keys(donationsByMethod).map(method => ({
        name: method,
        percentage: ((donationsByMethod[method] / total) * 100),
        total: donationsByMethod[method]
    }))

    const topMonth = Object.entries(donationsByMonth).reduce((max, [month, data]) =>
        data.total > max.total ? { month, total: data.total } : max,
        { month: '', total: 0 }
    )

    const topMethod = Object.entries(donationsByMethod).reduce((max, [method, total]) =>
        total > max.total ? { method, total } : max,
        { method: '', total: 0 }
    )

    chartData.value = {
        rawData: data,
        seriesByMethod: columnSeries,
        seriesByMonth: lineSeries,
        categories: uniqueMonths
    }

    stats.value = {
        totalDonations: total,
        averagePerMonth: total / uniqueMonths.length,
        topMonth,
        topMethod,
        methodPercentages,
        uniqueDonors: data.reduce((sum, item) => sum + item.unique_donors, 0)
    }
}

const initFilters = () => {
  const [minDate, maxDate] = getMinAndMaxDate(chartData.value.rawData, 'month')
  const [min, max] = getMinAndMaxAmount(chartData.value.rawData, 'total_donations')

  minAmount.value = min
  maxAmount.value = max
  amountRange.value = [min, max]
  dateRangeValue.value.startDate = minDate
  dateRangeValue.value.endDate = maxDate
}

const handleFilterClick = () => {
  const start = dateRangeValue.value?.startDate
  const end = dateRangeValue.value?.endDate
  const [min, max] = amountRange.value

  const filteredByDate = filterByDateRange(chartData.value.rawData, 'month', start, end)
  const filteredByAmount = filterByAmountRange(filteredByDate, 'total_donations', min, max)
  processDonationData(filteredByAmount)
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
            <label for="date-filter">Rango de fecha</label>
            <Divider />
            <DateFilter id="date-filter" ref="dateRangeValue"/>
          </div>
          <div class="filter">
            <label for="money-filter">Rango de valor monetario</label>
            <Divider />
            <AmountFilter id="money-filter" :unity="'$'" v-model="amountRange" :min="minAmount" :max="maxAmount"/>
          </div>
        </section>
        <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" @click="handleClearClick"/>
      </aside>
      <section class="content">
          <h1>Tendencias de Donaciones</h1>
          <section class="data-table">
              <h2>Detalle por Mes y Método de Pago</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Mes</th>
                          <th>Método de Pago</th>
                          <th>Total Donado</th>
                          <th>Donantes Únicos</th>
                          <th>% del Método</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item, index) in chartData.rawData" :key="index">
                          <td>{{ item.month }}</td>
                          <td>{{ item.pay_method }}</td>
                          <td>${{ item.total_donations.toLocaleString() }}</td>
                          <td>{{ item.unique_donors }}</td>
                          <td>{{ ((item.total_donations / stats.totalDonations) * 100).toFixed(2) }}%</td>
                      </tr>
                  </tbody>
              </table>
          </section>

          <section class="charts">
              <div class="report">
                  <h2>Resumen General</h2>
                  <div>Total donado: <strong>${{ stats.totalDonations.toLocaleString() }}</strong></div>
                  <div>Promedio mensual: <strong>${{ stats.averagePerMonth.toFixed(2) }}</strong></div>
                  <div>Donantes únicos: <strong>{{ stats.uniqueDonors }}</strong></div>
                  <div>Mes con más donaciones: <strong>{{ stats.topMonth.month }} (${{ stats.topMonth.total
                          }})</strong></div>
                  <div>Método más usado: <strong>{{ stats.topMethod.method }} ({{ ((stats.topMethod.total /
                      stats.totalDonations) * 100).toFixed(2) }}%)</strong></div>
              </div>

              <LineChart :categories="chartData.categories" :series="chartData.seriesByMonth"
                  title="Tendencia de Donaciones por Mes" :width="600" :height="400" />

              <ColumnChart :categories="chartData.categories" :series="chartData.seriesByMethod"
                  title="Donaciones por Método de Pago" :width="600" :height="400" />

              <PieChart :labels="stats.methodPercentages.map(item => `${item.name} (${item.percentage.toFixed(2)}%)`)"
                  :series="stats.methodPercentages.map(item => item.total)" title="Distribución por Método de Pago"
                  :width="600" :height="400" />
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

.content h1{
    flex: 1;
}

.charts {
  flex: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 710px;
  flex-direction: column;
  overflow-y: scroll;
}

.filters {
  height: inherit;
  margin-top: 3.3rem;
  background: #343a3f;
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

.report div:hover {
  padding: 0.1rem;
  border-radius: 5px;
  background: #485057;
  transform: scale(1.1);
}

.data-table {
  flex: 6;
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
