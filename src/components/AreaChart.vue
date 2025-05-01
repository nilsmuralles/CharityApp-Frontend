<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  series: Array<any>
  categories: string[]
  title: string
  height?: number
  width?: number
}>(), {
  height: 400,
  width: 600
})

const computedOptions = computed(() => ({
  chart: {
    id: 'area-chart',
    animations: {
      enabled: true,
      speed: 100,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },
  },
  title: {
    text: props.title,
    align: 'center',
    offsetX: 0,
    offsetY: 12,
    style: {
      fontSize:  '1.25rem',
      fontWeight:  'bold',
    },
  },
  xaxis: { categories: props.categories },
  theme: {
    mode: 'dark',
    palette: 'palette7',
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2,
      stops: [0, 90, 100]
    }
  },
  legend: {
    show: true
  }
}))
</script>

<template>
  <div class="chart-container">
    <apexchart type="area" :options="computedOptions" :series="series" :height="props.height" :width="props.width" />
  </div>
</template>

<style scoped>
.chart-container {
  margin: 1rem;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  background: #343a3f;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
