<template>
  <v-app>
    <NavbarComponent />

    <v-card>
      <v-card-title>
        <ToolbarChip :getTitle="pageName"></ToolbarChip>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
      </v-card-title>

      <v-data-table dense :headers="headers" :items="products" :search="search" class="elevation-1">
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.productName }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.price }} ₺</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.description }}</td>
            <td>
              <span :class="item.quantity < item.minQuantityValue ? 'badge bg-danger' : 'badge bg-success'">
                {{ item.quantity < item.minQuantityValue ? 'Kritik Seviye' : 'Normal' }}
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-app>
</template>

<script>
import axios from 'axios';
import config from '@/config';
import ToolbarChip from "@/components/base/ToolBar.vue";
import NavbarComponent from '@/components/base/NavbarComponent.vue'; // Navbar bileşenini içe aktarın

export default {
  name: 'ProductTable',
  components: {
    ToolbarChip,
    NavbarComponent,
  },

  data() {
    return {
      products: [
        {
          id: 1,
          productName: 'Ürün 1',
          category: "X",
          price: 33.3,
          quantity: 50,
          description: 'Açıklama 1',
          minQuantityValue: 50
        },
        {
          id: 2,
          productName: 'Ürün 2',
          category: "Y",
          price: 10.5,
          quantity: 50,
          description: 'Açıklama 2',
          minQuantityValue: 100
        },
      ],
      search: '',
      headers: [
        { align: 'start', key: 'productName', title: 'Ürün Adı' },
        { key: 'Category', title: 'Kategori' },
        { key: 'price', title: 'Fiyat' },
        { key: 'quantity', title: 'Miktar' },
        { key: 'description', title: 'Açıklama' },
        { key: '', title: 'Durum' },
      ],
      pageName: "Ürünler",
    };
  },
  methods: {
    login() {
      this.$router.push({ path: '/login' }); 
    }
  },
  mounted() {
    axios.get(`${config.apiBaseUrl}/ProductService`)
      .then(response => {
        this.products = response.data.data;
      })
      .catch(error => {
        console.error('API hatası:', error);
      });
  }
};
</script>

<style scoped>
.badge {
  padding: 0.5em;
  font-size: 0.9em;
}

.bg-danger {
  background-color: #dc3545;
}

.bg-success {
  background-color: #28a745;
}

.v-toolbar-title {
  font-weight: bold;
}

.v-btn {
  margin-right: 16px;
}


</style>
