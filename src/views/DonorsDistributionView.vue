<script setup>
import { Button, Divider, SelectButton } from 'primevue';
import { ref, onMounted } from 'vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { filterByType, sortAmount } from '@/utils/filters'

const category = ref()
const options = ['Empresa', 'Individual']

const chartData = ref({
    rawData: [],
    seriesDonors: [],
    seriesAmounts: [],
    categories: []
})

const stats = ref({
    totalDonors: 0,
    totalAmount: 0,
    averagePerDonor: 0,
    topCategoryByDonors: { name: '', donors: 0, amount: 0 },
    topCategoryByAmount: { name: '', donors: 0, amount: 0 },
    distributionPercentages: []
})

const getTopCategory = (data, key) => {
    const top = data.reduce((maxItem, currentItem) => {
        return currentItem[key] > maxItem[key] ? currentItem : maxItem
    }, data[0])

    return {
        name: top.category,
        donors: top.total_donors,
        amount: top.total_amount
    }
}

const getData = async () => {
    try {
        const res = await fetch('http://localhost:8080/api/donors-distribution')
        if (!res.ok) throw new Error('Error al obtener la distribución de donantes')
        const { data } = await res.json()
        transformDonorData(data)
    } catch (err) {
        console.error(err)
        alert(err.message || 'Error al cargar los datos')
    }
}

const transformDonorData = (data) => {
    const totalDonors = data.reduce((sum, i) => sum + i.total_donors, 0)
    const totalAmount = data.reduce((sum, i) => sum + i.total_amount, 0)

    const distributionPercentages = data.map(item => ({
        name: item.category,
        donorsPercentage: (item.total_donors / totalDonors) * 100,
        amountPercentage: (item.total_amount / totalAmount) * 100,
        monetaryDonors: item.monetary_donors,
        nonMonetaryDonors: item.no_monetary_donors,
        totalAmount: item.total_amount
    }))

    chartData.value = {
        rawData: data,
        categories: data.map(i => i.category),
        seriesDonors: [
            { name: 'Donantes Monetarios', data: data.map(i => i.monetary_donors) },
            { name: 'Donantes No Monetarios', data: data.map(i => i.no_monetary_donors) },
            { name: 'Total Donantes', data: data.map(i => i.total_donors) }
        ],
        seriesAmounts: [
            { name: 'Monto Total', data: data.map(i => i.total_amount) }
        ]
    }

    stats.value = {
        totalDonors,
        totalAmount,
        averagePerDonor: totalAmount / totalDonors,
        topCategoryByDonors: getTopCategory(data, 'total_donors'),
        topCategoryByAmount: getTopCategory(data, 'total_amount'),
        distributionPercentages
    }

}

const handleSortAmount = () => {
  const sorted = sortAmount(chartData.value.rawData, 'total_amount')
  transformDonorData(sorted);
}

const handleSortDonnors = () => {
  const sorted = sortAmount(chartData.value.rawData, 'monetary_donors')
  transformDonorData(sorted);
}

const handleSortDonnorsNotMonetary = () => {
  const sorted = sortAmount(chartData.value.rawData, 'no_monetary_donors')
  transformDonorData(sorted);
}

const handleFilterClick = () => {
  const filteredByType = filterByType(chartData.value.rawData, 'category', category.value)
  transformDonorData(filteredByType)
}

const handleClearClick = async () => {
  await getData()
}

onMounted(() => {
  getData()
})
</script>


<template>
    <main class="container">
        <aside class="filters">
          <Button label="Filter" class="btn-filter" icon="pi pi-filter" iconPos="right" @click="handleFilterClick"/>
          <section class="filter-sction">
            <div class="filter">
              <label for="monetary-order">Ordenar por total donado</label>
              <Divider />
              <Button label="Ordenar" icon="pi pi-sort-numeric-down" iconPos="right" severity="secondary" raised @click="handleSortAmount"/>
            </div>
            <div class="filter">
              <label for="type-filter">Categoría</label>
              <Divider />
              <div class="select-wrapper">
                <SelectButton v-model="category" :options="options" />
              </div>
            </div>
            <div class="filter">
              <label for="donnor-order">Ordenar por total de donadores</label>
              <Divider />
              <Button label="Ordenar" icon="pi pi-sort-numeric-down" iconPos="right" severity="secondary" raised @click="handleSortDonnors"/>
            </div>
            <div class="filter">
              <label for="donnor-order">Ordenar por total de donadores (no monetarios)</label>
              <Divider />
              <Button label="Ordenar" icon="pi pi-sort-numeric-down" iconPos="right" severity="secondary" raised @click="handleSortDonnorsNotMonetary"/>
            </div>
          </section>
          <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" @click="handleClearClick"/>
        </aside>
        <section class="content">
            <h1>Distribución de Donantes</h1>

            <section class="data-table">
                <h2>Detalle por Categoría</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Donantes Totales</th>
                            <th>Donantes Monetarios</th>
                            <th>Donantes No Monetarios</th>
                            <th>Monto Total</th>
                            <th>% Donantes</th>
                            <th>% Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in stats.distributionPercentages" :key="item.name">
                            <td>{{ item.name }}</td>
                            <td>{{ item.monetaryDonors + item.nonMonetaryDonors }}</td>
                            <td>{{ item.monetaryDonors }}</td>
                            <td>{{ item.nonMonetaryDonors }}</td>
                            <td>${{ item.totalAmount.toLocaleString() }}</td>
                            <td>{{ item.donorsPercentage.toFixed(2) }}%</td>
                            <td>{{ item.amountPercentage.toFixed(2) }}%</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="charts">
                <div class="report">
                    <h2>Resumen General</h2>
                    <div>Total donantes: <strong>{{ stats.totalDonors }}</strong></div>
                    <div>Monto total: <strong>${{ stats.totalAmount.toLocaleString() }}</strong></div>
                    <div>Promedio por donante: <strong>${{ stats.averagePerDonor.toFixed(2) }}</strong></div>
                    <div>Categoría con más donantes: <strong>{{ stats.topCategoryByDonors.name }} ({{stats.topCategoryByDonors.donors }})</strong></div>
                    <div>Categoría con mayor monto: <strong>{{ stats.topCategoryByAmount.name }} (${{
                        stats.topCategoryByAmount.amount.toLocaleString() }})</strong></div>
                </div>

                <BarChart :categories="chartData.categories" :series="chartData.seriesDonors"
                    title="Donantes por Categoría" :width="600" :height="400" />

                <ColumnChart :categories="chartData.categories" :series="chartData.seriesAmounts"
                    title="Monto Total por Categoría" :width="600" :height="400" />

                <PieChart
                    :labels="stats.distributionPercentages.map(item => `${item.name} (${item.amountPercentage}%)`)"
                    :series="stats.distributionPercentages.map(item => item.totalAmount)"
                    title="Distribución de Montos por Categoría" :width="600" :height="400" />
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
