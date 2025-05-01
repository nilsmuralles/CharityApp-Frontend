<script setup>
import { ref, onMounted } from 'vue'
import ColumnChart from '@/components/ColumnChart.vue'

const series = ref([
  {
    name: 'Donaciones',
    data: [500,205,230,580,458,954,120,456,453,245,654,123]
  }
])
const categories = ref(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'])

</script>


<template>
  <main>
    
    <div class="container">
      <h1>Prueba de graficas en Vue </h1>
      <div class="chart-grid">
        <ColumnChart :series="series" :categories="categories" title="Donaciones por Mes"  :height="300" :width="500" />
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
