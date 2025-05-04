<script setup>
  import { DatePicker, InputGroup, InputGroupAddon } from 'primevue';
  import 'primeicons/primeicons.css'
</script>

<template>
  <main>
    <label for="startDate">Desde</label>
    <InputGroup>
      <InputGroupAddon>
        <i class="pi pi-calendar"></i>
      </InputGroupAddon>
      <DatePicker input-id="startDate"/>
    </InputGroup>
    <label for="endDate">hasta</label>
    <InputGroup>
      <InputGroupAddon>
        <i class="pi pi-calendar"></i>
      </InputGroupAddon>
      <DatePicker input-id="endDate"/>
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
