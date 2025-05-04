<script setup>
  import { Slider } from 'primevue';
  import { ref } from 'vue';
  const props = defineProps({
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    }
  })
  const amountRange = ref([props.min, props.max])
</script>

<template>
  <main>
    <span>${{ amountRange[0] }}</span>
    <div class="slider-container">
      <Slider range v-model="amountRange" :min="props.min" :max="props.max"/>
    </div>
    <span>${{ amountRange[1] }}</span>
  </main>
</template>

<style scoped>
  .slider-container {
    width: 20rem;
  }
  
  main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
</style>
