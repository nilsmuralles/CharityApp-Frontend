<script setup>
import FilterPanel from '@/components/filters/FilterPanel.vue';
import ColumnChart from '@/components/charts/ColumnChart.vue';
import PieChart from '@/components/charts/PieChart.vue'
import { ref, onMounted } from 'vue'
import LineChart from '@/components/charts/LineChart.vue';

const chartData = ref({
    rawData: {},
    series_donations: [],
    series_pay_method: [],
    categories_line: [],
    categories_column: []
});

const stats = ref({
    totalDonations: 0,
    topCampaign: { name: '', amount: 0 },
    campaignPercentages: [],
});

const getData = async () => {
    try {
        const response = await fetch(`http://localhost:8080/api/trending-donations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Hubo un problema al obtener las donaciones en tendencia')
        }
        const { data } = await response.json()
        chartData.value = {
            rawData: data,
            series_donations: [{
                name: 'Donaciones',
                data: data.map(item => item.total_donations)
            }],
            series_pay_method: [{
                name: 'Métodos de pago',
                data: data.map(item => item.pay_method)
            }],
            categories_line: data.map(item => item.month),
            categories_column: data.map(item => item.pay_method)
        };

        // const total = data.reduce((sum, campaign) => sum + campaign.monetary_total, 0);

        // const topCampaign = data.reduce((max, campaign) => 
        //   campaign.monetary_total > max.amount ? 
        //   { name: campaign.campaign, amount: campaign.monetary_total } : max, 
        //   { name: '', amount: 0 }
        // );

        // const percentages = data.map(campaign => ({
        //   name: campaign.campaign,
        //   percentage: ((campaign.monetary_total / total) * 100).toFixed(2),
        // }));

        // stats.value = {
        //   totalDonations: total,
        //   topCampaign,
        //   campaignPercentages: percentages,
        // };

    } catch (e) {
        console.log(e)
        alert(e.message || 'Ocurrió un error al obtener la data')
    }
}

onMounted(() => {
    getData();
});
</script>

<template>
    <main class="container">
        <aside class="filters">
            <FilterPanel />
        </aside>
        <section class="content">
            <h1>Donaciones en tendencia</h1>
            <section class="charts">
                <!-- <div class="report">
            <h2>Resumen</h2>
            <div>Campaña con mas donaciones: {{ stats.topCampaign.name }} </div>
            <div>Monto obtenido por la campaña: {{ stats.topCampaign.amount }}</div>
            <div>Monto total obtenido: {{ stats.totalDonations }} </div>
            <div>Aporte de la campaña: {{ ((stats.topCampaign.amount / stats.totalDonations) * 100).toFixed(2) }}%</div>
        </div> -->
                <LineChart :categories="chartData.categories_line" :series="chartData.series_donations" title=""
                    :width="600" :height="400" />
                <ColumnChart :categories="chartData.categories_column" :series="chartData.series_pay_method" title=""
                    :width="600" :height="400" />
                <PieChart :labels="chartData.categories_column" :series="chartData.series_pay_method" title=""
                    :width="600" :height="400" />
            </section>
            <section class="data-table">
                <h2>Detalle de Donaciones</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>Donaciones totales</th>
                            <th>Donadores unicos</th>
                            <th>Método de pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in chartData.rawData" :key="index">
                            <td>{{ new Date(chartData.rawData[index].month).toLocaleDateString() }}</td>
                            <td>${{ chartData.rawData[index].total_donations.toLocaleString() }}</td>
                            <td>{{ chartData.rawData[index].unique_donors }}</td>
                            <td>{{ chartData.rawData[index].pay_method }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </section>
    </main>
</template>

<style scoped>
.container {
    box-sizing: content-box;
    height: 100dvh;
    width: 100%;
    display: flex;
    gap: 2rem;
    justify-content: center;
    overflow: hidden;
}

.filters {
    margin-top: 4.5rem;
}

.content {
    margin-top: 4.5rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.charts {
    display: flex;
    width: 660px;
    overflow-x: scroll;
}

.report {
    width: 600px;
    height: 400px;
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

/* Tabla de datos */
.data-table {
    background: var(--color-background);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
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