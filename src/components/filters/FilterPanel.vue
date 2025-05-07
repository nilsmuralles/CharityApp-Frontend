<script setup>
  import { Button, Divider } from 'primevue';
  import 'primeicons/primeicons.css'
  import DateFilter from './DateFilter.vue';
  import AmountFilter from './AmountFilter.vue';
</script>

<template>
  <aside>
    <Button label="Filter" class="btn-filter" icon="pi pi-filter" iconPos="right" />
    <section class="filter-sction">
      <div class="filter">
        <label for="date-filter">Rango de fecha</label>
        <Divider />
        <DateFilter id="date-filter"/>
      </div>
      <div class="filter">
        <label for="money-filter">Rango de valor monetario</label>
        <Divider />
        <AmountFilter id="money-filter"/>
      </div>
    </section>
    <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" />
  </aside>
</template>

<style scoped>
  aside {
    width: 500px;
    height: 100dvh;
    background-color: #343A3F;
    padding: 40px;
  }

  .filter-sction {
    display: flex;
    flex-direction: column;
    padding: 50px 0;
    gap: 50px;
  }

  .filter {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 1.15rem;
    font-weight: bold;
  }

  .p-divider {
    border-top: 1px solid lightgray;
  }
</style>
