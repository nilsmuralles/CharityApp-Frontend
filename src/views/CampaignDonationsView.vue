<script setup>
import { Button, Divider } from 'primevue';
import 'primeicons/primeicons.css'
import ColumnChart from '@/components/charts/ColumnChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import LineChart from '@/components/charts/LineChart.vue';
import DateFilter from '@/components/filters/DateFilter.vue';
import AmountFilter from '@/components/filters/AmountFilter.vue';
import { ref, onMounted } from 'vue';
import { filterAlphabetically, filterByAmountRange, filterByDateRange, getMinAndMaxAmount, getMinAndMaxDate } from '@/utils/filters';

const dateRangeValue = ref()

const minAmount = ref()
const maxAmount = ref()
const amountRange = ref([])

const chartData = ref({
  rawData: [],
  series_monetary: [],
  series_dates: [],
  categories_column: [],
  categories_line: []
});

const stats = ref({
  totalDonations: 0,
  topCampaign: { name: '', amount: 0 },
  campaignPercentages: [],
  top5Campaigns: []
});

const formatDate = (isoDate) => isoDate.split('T')[0];

const calculateDonationsByDate = (data) => {
  const grouped = {};

  data.forEach(({ end_date, monetary_total, no_monetary_donations }) => {
    const date = formatDate(end_date);
    grouped[date] ??= { monetary: 0, nonMonetary: 0, total: 0 };

    grouped[date].monetary += monetary_total;
    grouped[date].nonMonetary += no_monetary_donations;
    grouped[date].total += monetary_total + no_monetary_donations;
  });

  const dates = Object.keys(grouped).sort();
  const series = {
    monetary: dates.map(date => grouped[date].monetary),
    nonMonetary: dates.map(date => grouped[date].nonMonetary),
    total: dates.map(date => grouped[date].total)
  };

  return { dates, series };
};

const calculateStats = (data) => {
  const totalDonations = data.reduce((sum, c) => sum + c.monetary_total, 0);

  const topCampaign = data.reduce((max, c) =>
    c.monetary_total > max.amount
      ? { name: c.campaign, amount: c.monetary_total }
      : max,
    { name: '', amount: 0 }
  );

  const campaignPercentages = data.map(c => ({
    name: c.campaign,
    percentage: ((c.monetary_total / totalDonations) * 100).toFixed(2)
  }));

  const enriched = data.map(c => ({
    ...c,
    totalDonations: c.monetary_total + c.no_monetary_donations
  }));

  const top5 = enriched
    .sort((a, b) => b.totalDonations - a.totalDonations)
    .slice(0, 5);

  const top5Total = top5.reduce((sum, c) => sum + c.totalDonations, 0);

  const top5Summary = top5.map(c => ({
    name: c.campaign,
    percentage: ((c.totalDonations / top5Total) * 100).toFixed(2),
    total: c.totalDonations,
    monetary: c.monetary_total,
    nonMonetary: c.no_monetary_donations
  }));

  return { totalDonations, topCampaign, campaignPercentages, top5Campaigns: top5Summary };
};

const updateData = (data) => {
  chartData.value.rawData = data;

  const { dates, series } = calculateDonationsByDate(data);

  chartData.value.series_monetary = [{
    name: 'Donaciones Monetarias',
    data: data.map(c => c.monetary_total)
  }];
  chartData.value.series_dates = [
    { name: 'Monetarias', data: series.monetary },
    { name: 'No Monetarias', data: series.nonMonetary },
    { name: 'Total', data: series.total }
  ];
  chartData.value.categories_column = data.map(c => c.campaign);
  chartData.value.categories_line = dates;

  stats.value = calculateStats(data);
}

const getData = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/campaign-donations');
    if (!response.ok) throw new Error('Error al obtener las donaciones');
    const { data } = await response.json();
    updateData(data)
  } catch (e) {
    console.error(e);
    alert(e.message || 'Ocurrió un error al obtener los datos');
  }
};

const initFilters = () => {
  const [minDate, maxDate] = getMinAndMaxDate(chartData.value.rawData, 'end_date')
  const [min, max] = getMinAndMaxAmount(chartData.value.rawData, 'monetary_total')

  minAmount.value = min
  maxAmount.value = max
  amountRange.value = [min, max]
  dateRangeValue.value.startDate = minDate
  dateRangeValue.value.endDate = maxDate
}

const handleFilterClick = () => {
  const start = dateRangeValue.value?.startDate
  const end = dateRangeValue.value?.endDate
  const [min, max] = amountRange.value

  const filteredByDate = filterByDateRange(chartData.value.rawData, 'end_date', start, end)
  const filteredByAmount = filterByAmountRange(filteredByDate, 'monetary_total', min, max)
  updateData(filteredByAmount)
}

const handleSortAlphabetically = () => {
  const sortedAlphabetically = filterAlphabetically(chartData.value.rawData)
  updateData(sortedAlphabetically)
}

const handleClearClick = async () => {
  await getData()
  initFilters()
}

onMounted(async () => {
  await getData()
  initFilters()
});
</script>

<template>
  <main class="container">
    <aside class="filters">
      <Button label="Filter" class="btn-filter" icon="pi pi-filter" iconPos="right" @click="handleFilterClick"/>
      <section class="filter-sction">
        <div class="filter">
          <label for="date-filter">Rango de fecha</label>
          <Divider />
          <DateFilter id="date-filter" ref="dateRangeValue"/>
        </div>
        <div class="filter">
          <label for="money-filter">Rango de valor monetario</label>
          <Divider />
          <AmountFilter id="money-filter" v-model="amountRange" :min="minAmount" :max="maxAmount"/>
        </div>
        <div class="filter">
          <label for="alphabetical-order">Ordenar alfabéticamente</label>
          <Divider />
          <Button label="Ordenar" icon="pi pi-sort-alpha-down" iconPos="right" severity="secondary" raised @click="handleSortAlphabetically"/>
        </div>
      </section>
      <Button label="Clear" class="btn-clear" icon="pi pi-times" severity="danger" iconPos="right" @click="handleClearClick"/>
    </aside>
    <section class="content">
      <h1>Donaciones por campaña</h1>
      <section class="data-table">
        <h2>Detalle de Campañas</h2>
        <table>
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Fecha Fin</th>
              <th>Donaciones ($)</th>
              <th>Donaciones No Monetarias</th>
              <th>Artículos Donados</th>
              <th>% del Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stats.campaignPercentages" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ new Date(chartData.rawData[index].end_date).toLocaleDateString() }}</td>
              <td>${{ chartData.rawData[index].monetary_total.toLocaleString() }}</td>
              <td>{{ chartData.rawData[index].no_monetary_donations }}</td>
              <td>{{ chartData.rawData[index].total_donated_articles }}</td>
              <td>{{ item.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="charts">
        <div class="report">
          <h2>Resumen</h2>
          <div>Campaña con mas donaciones: <strong>{{ stats.topCampaign.name }}</strong></div>
          <div>Monto obtenido por la campaña: <strong>{{ stats.topCampaign.amount }}</strong></div>
          <div>Monto total obtenido: <strong>{{ stats.totalDonations }}</strong></div>
          <div>Aporte de la campaña: <strong>{{ ((stats.topCampaign.amount / stats.totalDonations) * 100).toFixed(2)
          }}%</strong></div>
        </div>
        <ColumnChart :categories="chartData.categories_column" :series="chartData.series_monetary" title="" :width="600"
          :height="400" />
        <LineChart :categories="chartData.categories_line" :series="chartData.series_dates" title="" :width="600"
          :height="400" />
        <PieChart :labels="stats.top5Campaigns.map(item => `${item.name} (${item.percentage}%)`)"
          :series="stats.top5Campaigns.map(item => item.total)" title="Top 5 Campañas con mas donaciones" :width="600"
          :height="400" />
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

.filters {
  height: inherit;
  margin-top: 3.3rem;
  background: #343a3f;
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

.charts strong {
  font-weight: 500;
}

.report div:hover {
  padding: 0.1rem;
  border-radius: 5px;
  background: #485057;
  transform: scale(1.1);
}

.report {
  width: 650px;
  height: 520px;
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

th,
td {
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
