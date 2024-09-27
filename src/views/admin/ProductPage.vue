<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3" lg="2" class="no-padding">
        <ParentComponent />
      </v-col>
      <v-col cols="12" mt="10" lg="10" class="no-padding">
        <v-row class="d-flex justify-space-between align-center pt-3 pb-2 mt-10">
          <v-col>
            <ToolbarChip :getTitle="pageName"></ToolbarChip>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            <v-select style="border-radius: 10%; width: 97%;" v-model="filters.category" :items="filterCategories"
              item-title="categoryName" item-value="id" @click="getCategories()" label="Kategoriye Göre Filtrele"
              clearable hide-details ></v-select>

            <v-text-field v-model="search"  append-icon="mdi-magnify" label="Search" style="border-radius: 50px; width: 100%;" single-line
              hide-details></v-text-field>
            <v-btn color="primary" @click="openProductModal(null)">Ürün Ekle</v-btn>
          </v-card-title>

          <v-data-table dense :headers="headers" :items="filteredDatas" :search="search" class="elevation-1">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.productName }}</td>
                <td>{{ item.category }}</td>
                <td>{{ item.costPrice }} ₺</td>
                <td>{{ item.salePrice }} ₺</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <span :class="item.quantity < item.minQuantityValue ? 'badge bg-danger' : 'badge bg-success'">
                    {{ item.quantity < item.minQuantityValue ? 'Kritik Seviye' : 'Normal' }} </span>
                </td>
                <td>
                  <v-btn icon @click="openProductModal(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click="deleteData(item.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <v-dialog v-model="showDataModal" max-width="500px">
          <v-card>
            <v-card-title>{{ isEditing ? 'Ürün Güncelle' : 'Yeni Ürün Ekle' }}</v-card-title>
            <v-card-text>
              <v-form ref="productForm">
                <v-text-field v-model="formData.productName" label="Ürün Adı" required></v-text-field>
                <v-select v-model="formData.categoryId" @click="getCategories()" :items="categories"
                  item-title="categoryName" item-value="id" label="Kategori" required>
                </v-select>
                <v-text-field v-model="formData.costPrice" label="Alış Fiyatı" type="number" required></v-text-field>
                <v-text-field v-model="formData.salePrice" label="Satış Fiyat" type="number" required></v-text-field>
                <v-text-field v-model="formData.quantity" label="Miktar" type="number" required></v-text-field>
                <v-text-field v-model="formData.minQuantityValue" label="Minimum Adet" type="number"
                  required></v-text-field>
                <v-text-field v-model="formData.MaxCapacity" label="Maksimum Stok Adet" type="number"
                  required></v-text-field>
                <v-text-field v-model="formData.description" label="Açıklama"></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showDataModal = false">İptal</v-btn>
              <v-btn color="primary" @click="isEditing ? updateData() : createData()">
                {{ isEditing ? 'Güncelle' : 'Ekle' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import config from '@/config';
import ToolbarChip from "@/components/base/ToolBar.vue";
import ParentComponent from '@/components/base/ParentComponent.vue';

export default {
  name: 'ProductTable',
  components: {
    ToolbarChip,
    ParentComponent,
  },
  data() {
    return {
      datas: [],
      categories: [],
      filterCategories: [],
      search: '',
      headers: [
        { align: 'start', key: 'productName', title: 'Ürün Adı' },
        { key: 'category', title: 'Kategori' },
        { key: 'costPrice', title: 'Alış Fiyatı' },
        { key: 'salePrice', title: 'Satış Fiyatı' },
        { key: 'quantity', title: 'Miktar' },
        { key: 'description', title: 'Açıklama' },
        { key: 'status', title: 'Durum' },
        { key: 'actions', title: 'İşlemler' },
      ],
      pageName: "Ürünler",
      showDataModal: false,
      isEditing: false,
      formData: {
        productName: '',
        categoryId: null,
        costPrice: 0,
        salePrice: 0,
        quantity: 0,
        description: '',
        MinQuantityValue: 0,
        MaxCapacity: 0,
        IsDeleted: false
      },
      filters: {
        category: null,
      },
    };
  },
  computed: {
    filteredDatas() {
      if (this.filters.category) {
        return this.datas.filter(item => item.categoryId === this.filters.category);
      }
      return this.datas;
    }
  },
  methods: {
    openProductModal(product) {

      if (product) {
        this.isEditing = true;
        this.formData = { ...product };
      } else {
        this.isEditing = false;
        this.resetForm();
      }
      this.showDataModal = true;
    },
    resetForm() {
      this.formData = {
        id: null,
        productName: '',
        categoryId: null,
        costPrice: 0,
        salePrice: 0,
        quantity: 0,
        description: ''
      };
    },
    createData() {
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');

      const dataModel = {
        CategoryId: this.formData.categoryId,
        ProductName: this.formData.productName,
        CostPrice: this.formData.costPrice,
        SalePrice: this.formData.salePrice,
        Quantity: this.formData.quantity,
        Description: this.formData.description,
        MinQuantityValue: this.formData.minQuantityValue,
        MaxCapacity: this.formData.MaxCapacity,
        Creator: userName,
        IsDeleted: false
      };

      axios.post(`${config.apiBaseUrl}/ProductService`, dataModel, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          this.getDatas();
          console.log(response)
          this.showDataModal = false;
        })
        .catch(error => {
          console.error('Ürün ekleme hatası:', error.response ? error.response.data : error.message);
        });
    },
    updateData() {
      const token = localStorage.getItem('token');
      axios.put(`${config.apiBaseUrl}/ProductService/${this.formData.id}`, this.formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          console.log(response)
          this.getDatas();
          this.showDataModal = false;
        })
        .catch(error => {
          console.error('Ürün güncelleme hatası:', error.response);
          console.error('Durum kodu:', error.response.status);
        });
    },
    deleteData(id) {
      const token = localStorage.getItem('token');
      axios.put(`${config.apiBaseUrl}/ProductService/delete/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(() => {
          this.datas = this.datas.filter(p => p.id !== id);
        })
        .catch(error => {
          console.error('Ürün silme hatası:', error);
        });
    },
    async getCategories() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/CategoryService`);
        this.categories = response.data.data;

        this.filterCategories = response.data.data;
        this.filterCategories = [{ id: null, categoryName: 'Tümü' }, ...this.filterCategories];
      } catch (error) {
        console.error('Kategori getirme hatası:', error);
      }
    },

    async getDatas() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/ProductService`);
        this.datas = response.data.data;
      } catch (error) {
        console.error('API hatası:', error);
      }
    }

  },
  mounted() {
    this.getDatas();

  },
};
</script>
