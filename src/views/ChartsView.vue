<script setup>
import { ref, onMounted } from 'vue'
import ColumnChart from '@/components/ColumnChart.vue'
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'
import AreaChart from '@/components/AreaChart.vue'

const series_bar = ref([
  {
    name: 'Donaciones 1',
    data: [500,205,230,580,458,954,120,456,453,245,654,123]
  }
])
const series_line = ref([
  {
    name: 'Donaciones 1',
    data: [500,205,230,580,458,954,120,456,453,245,654,123]
  },
  {
    name: 'Donaciones 2',
    data: [520,235,289,540,658,854,420,496,353,745,454,423]
  }
])
const series_pie = ref([500,205,230])
const labels_pie = ref(['FundaBien', 'Teleton', 'Juntos podemos'])
const categories = ref(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'])

</script>


<template>
  <main>
    
    <div class="container">
      <h1>Prueba de graficas en Vue </h1>
      <div class="chart-grid">
        <ColumnChart :series="series_bar" :categories="categories" title="Donaciones por Mes"  :height="300" :width="500" />
        <LineChart :series="series_line" :categories="categories" title="Donaciones por Mes"  :height="300" :width="500" />
        <PieChart :series="series_pie" :labels="labels_pie" title="Fundaciones con mas donaciones"  :height="300" :width="500" />
        <AreaChart :series="series_line" :categories="categories" title="Donaciones por Mes"  :height="300" :width="500" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.container{
  width: 100dvw;
  height: calc(100dvh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
</style>
