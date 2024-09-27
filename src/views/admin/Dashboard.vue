<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3" lg="2" class="no-padding">
        <ParentComponent />
      </v-col>

      <v-col cols="12" md="9" lg="10" class="px-md-4">
        <v-row class="d-flex justify-space-between align-center pt-3 pb-2 mt-10">
          <v-col>
            <ToolbarChip :getTitle="pageName"></ToolbarChip>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4" v-for="(product, index) in products" :key="product.id">
            <v-card class="mb-4">
              <v-card-title class="text-center">{{ product.productName }}</v-card-title>
              <v-card-text>
                <div class="chart-container">
                  <canvas :id="'doughnutChart' + index"></canvas>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import ToolbarChip from "@/components/base/ToolBar.vue";
import ParentComponent from '@/components/base/ParentComponent.vue';

export default {
  name: 'AdminDashboard',
  components: {
    ParentComponent,
    ToolbarChip,
  },
  data() {
    return {
      products: [],
      pageName:"Dashboard"
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    fetchProducts() {
      axios.get('https://localhost:7092/api/ProductService')
        .then(response => {
          this.products = response.data.data;
          this.$nextTick(() => {
            // Her ürün için grafik oluştur
            this.products.forEach((product, index) => {
              this.createDoughnutChart(product, index);
            });
          });
        })
        .catch(error => {
          console.error('API hatası:', error);
        });
    },
    createDoughnutChart(product, index) {
      const ctx = document.getElementById('doughnutChart' + index).getContext('2d');
      const availableStock = product.quantity;
      const usedStock = product.maxCapacity - product.quantity;

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Kullanılan Stok', 'Kalan Stok'],
          datasets: [{
            data: [usedStock, availableStock],
            backgroundColor: ['#ff6384', '#36a2eb'],
            hoverBackgroundColor: ['#ff6384', '#36a2eb']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.no-padding {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.chart-container {
  margin-top: 20px;
  height: 200px;
  width: 200px;
}
</style>
