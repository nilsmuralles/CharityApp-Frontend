<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  series: number[]
  labels: string[]
  title: string
  height?: number
  width?: number
}>(), {
  height: 400,
  width: 400
})

const computedOptions = computed(() => ({
  chart: {
    id: 'pie-chart',
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
  labels: props.labels,
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
  theme: {
    mode: 'dark',
    palette: 'palette2',
  },
  legend: {
    position: 'bottom'
  },
  plotOptions: {
      pie: {
        expandOnClick: true
      }
    }
}))
</script>

<template>
  <div class="chart-container">
    <apexchart type="pie" :options="computedOptions" :series="series" :height="props.height" :width="props.width" />
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
