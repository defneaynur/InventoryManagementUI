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
                <v-card class="pa-6 mb-4">
                    <v-row>
                        <v-col cols="12">
                            <v-btn color="red" @click="clearDates()">Tarihleri Temizle</v-btn>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-date-input v-model="filters.startDate" label="Başlangıç Tarihi" clearable prepend-icon=""
                                prepend-inner-icon="$calendar"></v-date-input>

                        </v-col>
                        <v-col cols="12" md="6">
                            <v-date-input v-model="filters.endDate" label="Bitiş Tarihi" clearable prepend-icon=""
                                prepend-inner-icon="$calendar"></v-date-input>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select v-model="filters.category" :items="categories" @click="getCategories()"
                                item-title="categoryName" item-value="id" label="Kategori Seç"></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select v-model="filters.movementType" :items="movementTypes" label="Hareket Tipi"
                                clearable></v-select>
                        </v-col>
                    </v-row>
                    <v-data-table dense :headers="headers" :items="filteredStockMovements" class="elevation-1">
                        <template v-slot:top>
                            <v-btn color="primary" @click="exportToCSV">CSV Olarak Dışa Aktar</v-btn>
                        </template>
                        <template v-slot:headers>
                            <tr>
                                <th v-for="header in headers" :key="header.key" v-show="header.isVisible !== false">
                                    {{ header.title }}
                                </th>
                            </tr>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.productName }}</td>
                                <td v-if="headers.find(header => header.key === 'categoryId' && header.isVisible)">{{
                                    item.categoryId }}</td>
                                <td>{{ item.categoryName }}</td>
                                <td>{{ item.oldQuantity }}</td>
                                <td>{{ item.currentQuantity }}</td>
                                <td>{{ item.note }}</td>
                                <td>{{ item.movementType === 1 ? 'Giriş' : 'Çıkış' }}</td>
                                <td>{{ item.created }}</td>
                                <td>{{ item.creator }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
import ParentComponent from '@/components/base/ParentComponent.vue';
import ToolbarChip from "@/components/base/ToolBar.vue";
import config from '@/config';

export default {
    components: {
        ToolbarChip,
        ParentComponent,
    },
    data() {
        return {
            pageName: "StokHareketleri",
            filters: {
                startDate: null,
                endDate: null,
                category: null,
                movementType: null,
                search: ''
            },
            categories: [],
            movementTypes: ['Giriş', 'Çıkış'],
            stockMovements: [],
            headers: [
                { title: 'Ürün Adı', key: 'productName' },
                { title: 'Kategori Id', key: 'categoryId', isVisible: false },
                { title: 'Kategori Adı', key: 'categoryName' },
                { title: 'Eski Miktar', key: 'oldQuantity' },
                { title: 'Güncel Miktar', key: 'currentQuantity' },
                { title: 'Not', key: 'note' },
                { title: 'Hareket Tipi', key: 'movementType' },
                { title: 'Tarih', key: 'created' },
                { title: 'Oluşturan', key: 'creator' },
            ],
        };
    },
    computed: {
        filteredStockMovements() {
            return this.filteredApply();
        },
        totalEntry() {
            return this.filteredStockMovements
                .filter(item => item.movementType === 'Giriş')
                .reduce((acc, item) => acc + item.quantity, 0);
        },
        totalExit() {
            return this.filteredStockMovements
                .filter(item => item.movementType === 'Çıkış')
                .reduce((acc, item) => acc + item.quantity, 0);
        },
        netStock() {
            return this.totalEntry - this.totalExit;
        }
    },
    methods: {
        filteredApply() {
            let filtered = this.stockMovements;

            if (this.filters.startDate && this.filters.endDate) {
                filtered = filtered.filter(item => new Date(item.created) >= new Date(this.filters.startDate) && new Date(item.created) <= new Date(this.filters.endDate));
            }

            if (this.filters.category) {
                filtered = filtered.filter(item => item.categoryId === this.filters.category);
            }

            if (this.filters.movementType) {
                filtered = filtered.filter(item => item.movementType === (this.filters.movementType == "Giriş" ? 1 : 0));
            }
            return filtered;
        },
        getCategories() {
            axios.get(`${config.apiBaseUrl}/CategoryService`)
                .then(response => {
                    this.categories = response.data.data;
                })
                .catch(error => {
                    console.error('API hatası:', error);
                });
        },
        getStockMovements() {
            axios.get(`${config.apiBaseUrl}/StockService`)
                .then(response => {
                    this.stockMovements = response.data.data;
                })
                .catch(error => {
                    console.error('Stok hareketlerini getirme hatası:', error);
                });
        },
        exportToCSV() {
            let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; 
            csvContent += this.headers
                .filter(h => h.title !== 'Kategori Id') 
                .map(h => h.title) 
                .join(',') + '\n';

            this.filteredStockMovements.forEach(item => {
                csvContent += `${item.productName},${item.categoryId},${item.categoryName},${item.oldQuantity},${item.currentQuantity},${item.note},${item.movementType === 1 ? 'Giriş' : 'Çıkış'},${item.created},${item.creator}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'stok_hareketleri.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); 
        },
        clearDates() {
            this.filters.startDate = null;
            this.filters.endDate = null;
            this.filteredApply();
        },
    },
    mounted() {
        this.getStockMovements();
    }
};
</script>
