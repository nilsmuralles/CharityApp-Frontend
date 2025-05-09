<script setup>
  import { DatePicker, InputGroup, InputGroupAddon } from 'primevue';
  import 'primeicons/primeicons.css'
  import { ref } from 'vue';

  const startDate = ref(null)
  const endDate = ref(null)

  defineExpose({
    startDate,
    endDate
  })
</script>
<template>
  <main>
    <label for="startDate">Desde</label>
    <InputGroup>
      <InputGroupAddon>
        <i class="pi pi-calendar"></i>
      </InputGroupAddon>
      <DatePicker input-id="startDate" v-model="startDate"/>
    </InputGroup>
    <label for="endDate">hasta</label>
    <InputGroup>
      <InputGroupAddon>
        <i class="pi pi-calendar"></i>
      </InputGroupAddon>
      <DatePicker input-id="endDate" v-model="endDate"/>
    </InputGroup>
  </main>
</template>

<style scoped>
  main {
    display: flex;
    gap: 10px;
  }

  label {
    font-size: 1rem;
    align-self: center;
  }
</style>
