<script setup>
  import { Slider } from 'primevue';

  const modelValue = defineModel({ type: Array });

  const props = defineProps({
    unity: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000 }
  });
</script>

<template>
  <main>
    <span>{{ props.unity + modelValue[0] }}</span>
    <div class="slider-container">
      <Slider range v-model="modelValue" :min="props.min" :max="props.max" />
    </div>
    <span>{{ props.unity + modelValue[1] }}</span>
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
