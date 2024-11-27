<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3" lg="2" class="no-padding">
        <ParentComponent />
      </v-col>
      <v-col cols="12" md="9" lg="10" class="no-padding">
        <v-row class="d-flex justify-space-between align-center pt-3 pb-2 mt-10">
          <v-col>
            <ToolbarChip :getTitle="pageName"></ToolbarChip>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
              hide-details></v-text-field>
            <v-btn color="primary" @click="openModal(null)">Kategori Ekle</v-btn>
          </v-card-title>

          <v-data-table dense :headers="headers" :items="filteredDatas" :search="search" class="elevation-1">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.categoryName }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.creator }} </td>
                <td>{{ item.created }}</td>
                <td>{{ item.changer }} </td>
                <td>{{ item.changed }}</td>
                <td>
                  <v-btn icon @click="openModal(item)">
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
              <v-form ref="categoryForm">
                <v-text-field v-model="formData.categoryName" label="Kategori Adı" required></v-text-field>
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
      search: '',
      headers: [
        { title: 'Kategori', key: 'categoryName' },
        { title: 'Açıklama', key: 'description' },
        { title: 'Oluşturan', key: 'creator' },
        { title: 'Oluşturma Tarihi', key: 'created' },
        { title: 'Değiştiren', key: 'changer' },
        { title: 'Değiştirme Tarihi', key: 'changed' },
        { title: 'İşlemler', key: 'actions', sortable: false },
      ],
      pageName: "Kategoriler",
      showDataModal: false,
      isEditing: false,
      formData: {
        categoryName: '',
        description: null,
      },
    };
  },

  computed: {
    filteredDatas() {
      if (!this.search) return this.datas;
      return this.datas.filter(item =>
        Object.keys(item).some(key =>
          String(item[key]).toLowerCase().includes(this.search.toLowerCase())
        )
      );
    }
  },

  methods: {
    openModal(data) {
      if (data) {
        this.isEditing = true;
        this.formData = { ...data };
      } else {
        this.isEditing = false;
        this.resetForm();
      }
      this.showDataModal = true;
    },

    resetForm() {
      this.formData = {
        categoryName: '',
        description: ''
      };
    },

    createData() {
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');

      const dataModel = {
        CategoryName: this.formData.categoryName,
        Description: this.formData.description,
        Creator: userName,
        IsDeleted: false
      };

      axios.post(`${config.apiBaseUrl}/CategoryService`, dataModel, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          this.datas.push(response.data.data);
          this.showDataModal = false;
        })
        .catch(error => {
          console.error('Ürün ekleme hatası:', error.response ? error.response.data : error.message);
        });
    },

    updateData() {
      const token = localStorage.getItem('token');
      axios.put(`${config.apiBaseUrl}/CategoryService/${this.formData.id}`, this.formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(() => {
          this.showDataModal = false;
          this.getDatas();
        })
        .catch(error => {
          console.error('Kategori güncelleme hatası:', error);
        });
    },

    deleteData(id) {
      const token = localStorage.getItem('token');
      axios.put(`${config.apiBaseUrl}/CategoryService/delete/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(() => {
          this.datas = this.datas.filter(p => p.id !== id);
        })
        .catch(error => {
          console.error('Kategori silme hatası:', error);
        });
    },
    getDatas() {
      axios.get(`${config.apiBaseUrl}/CategoryService`)
        .then(response => {
          this.datas = response.data.data;
        })
        .catch(error => {
          console.error('API hatası:', error);
        });
    }
  },

  mounted() {
    this.getDatas();
  },
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

.no-padding {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
