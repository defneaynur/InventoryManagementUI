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
            <v-btn color="primary" @click="openModal(null)">Kullanıcı Ekle</v-btn>
          </v-card-title>

          <v-data-table dense :headers="headers" :items="filteredDatas" :search="search" class="elevation-1">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.userName }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.name }}</td>
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
                <v-text-field v-model="formData.userName" label="Kullanıcı Adı" required></v-text-field>
                <v-text-field v-model="formData.password" label="Parola"></v-text-field>
                <v-text-field v-model="formData.email" label="Email" required></v-text-field>
                <v-text-field v-model="formData.name" label="Ad Soyad"></v-text-field>
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
        { title: 'Kullanıcı Adı', key: 'userName' },
        { title: 'Email', key: 'email' },
        { title: 'Ad', key: 'name' },
        { title: 'Oluşturan', key: 'creator' },
        { title: 'Oluşturma Tarihi', key: 'created' },
        { title: 'Değiştiren', key: 'changer' },
        { title: 'Değiştirme Tarihi', key: 'changed' },
      ],
      pageName: "Kullanıcı Yönetimi",
      showDataModal: false,
      isEditing: false,
      formData: {
        userName: '',
        password: '',
        email: '',
        name: '',
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
        userName: '',
        password: '',
        email: '',
        name: ''
      };
    },

    createData() {
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');

      const dataModel = {
        UserName: this.formData.userName,
        Password: this.formData.password,
        Email: this.formData.email,
        Name: this.formData.name,
        Creator: userName,
        IsDeleted: false
      };

      axios.post(`${config.apiBaseUrl}/UserService/register`, dataModel, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          this.datas.push(response.data.data);
          this.showDataModal = false;
        })
        .catch(error => {
          console.error('Kullanıcı ekleme hatası:', error.response ? error.response.data : error.message);
        });
    },

    updateData() {
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');

      const dataModel = {
        UserName: this.formData.userName,
        Password: this.formData.password,
        Email: this.formData.email,
        Name: this.formData.name,
        Changer: userName,
        Changed: new Date(),
        IsDeleted: false
      };

      axios.put(`${config.apiBaseUrl}/UserService/${this.formData.id}`, dataModel, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          console.log(response)
          this.showDataModal = false;
          this.getDatas();
        })
        .catch(error => {
          console.error('Kullanıcı güncelleme hatası:', error);
        });
    },

    deleteData(id) {
      const token = localStorage.getItem('token');
      axios.put(`${config.apiBaseUrl}/UserService/delete/${id}`, {}, {
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

    getDatas() {
      axios.get(`${config.apiBaseUrl}/UserService`)
        .then(response => {
          this.datas = response.data.data;
          console.log(response.data.data)
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