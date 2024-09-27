<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="3" lg="2" class="no-padding">
                <ParentComponent />
            </v-col>
            <v-col cols="12" md="9" lg="10" class="no-padding">
                <v-card>
                    <v-row class="d-flex justify-space-between align-center pt-3 pb-2 mt-10">
                        <v-col>
                            <ToolbarChip :getTitle="pageName"></ToolbarChip>
                        </v-col>
                    </v-row>
                    <v-card-title>
                        <v-text-field v-model="search" append-icon="mdi-magnify" label="Ara" single-line
                            hide-details></v-text-field>
                    </v-card-title>

                    <v-data-table dense :headers="headers" :items="products" :search="search" class="elevation-1">
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.productName }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>
                                    <v-btn icon @click="openModal(item)">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card>

                <v-dialog v-model="showDataModal" max-width="500px">
                    <v-card>
                        <v-card-title>{{ isEditing ? 'Stok Güncelle' : 'Yeni Stok İşlemi' }}</v-card-title>
                        <v-card-text>
                            <v-form ref="stockForm">
                                <v-text-field v-model="selectedProduct.productName" label="Ürün Adı"
                                    readonly></v-text-field>
                                <v-text-field v-model="stockValue" label="Stok Miktarı" type="number"
                                    required></v-text-field>
                                <v-select v-model="stockType" :items="stockTypes" label="İşlem Tipi"
                                    required></v-select>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="showDataModal = false">İptal</v-btn>
                            <v-btn color="primary" @click="isEditing ? updateStock() : createStock()">
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
import axios from "axios";
import config from "@/config";
import ToolbarChip from "@/components/base/ToolBar.vue";
import ParentComponent from "@/components/base/ParentComponent.vue";

export default {
    name: "StockPage",
    components: {
        ToolbarChip,
        ParentComponent,
    },
    data() {
        return {
            products: [],
            search: '',
            headers: [
                { key: 'productName', title: 'Ürün Adı' },
                { key: 'quantity', title: 'Mevcut Stok' },
                { key: 'actions', title: 'İşlemler' },
            ],
            pageName: "Stok Yönetimi",
            showDataModal: false,
            isEditing: false,
            selectedProduct: { id: null, productName: '' },
            stockValue: 0,
            stockType: null,
            stockTypes: ["Giriş", "Çıkış"],
        };
    },
    methods: {
        openModal(data) {
            if (data) {
                this.isEditing = true;
                this.selectedProduct = { id: data.id, productName: data.productName };
                this.stockValue = 0;
                this.stockType = null;
            } else {
                this.isEditing = false;
                this.resetForm();
            }
            this.showDataModal = true;
        },
        resetForm() {
            this.selectedProduct = { id: null, productName: '' };
            this.stockValue = 0;
            this.stockType = null;
        },
        updateStock() {
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');
            const selectedProductId = this.selectedProduct.id;
            if (!selectedProductId) return;

            let updatedQuantity = this.products.find(p => p.id === selectedProductId).quantity;

            var newQuantity = parseInt(updatedQuantity, 10);

            if (this.stockType === "Giriş") {
                newQuantity += parseInt(this.stockValue, 10);
            } else if (this.stockType === "Çıkış") {
                newQuantity -= parseInt(this.stockValue, 10);
                if (newQuantity < 0) newQuantity = 0;
            }
            const dataModel = {
                Quantity: newQuantity,
                Creator: userName,
                Changer: userName
            }
            axios.put(`${config.apiBaseUrl}/StockService/${selectedProductId}`,
                dataModel,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
                .then((response) => {
                    console.log("Stok güncellendi:", response.data);
                    this.getProducts();
                    this.resetForm();
                    this.showDataModal = false;
                })
                .catch((error) => {
                    console.error("Stok güncelleme hatası:", error);
                });
        },

        getProducts() {
            axios.get(`${config.apiBaseUrl}/ProductService`)
                .then(response => {
                    this.products = response.data.data;
                })
                .catch(error => {
                    console.error('API hatası:', error);
                });
        }
    },
    mounted() {
        this.getProducts();
    },
};
</script>

<style scoped>
.no-padding {
    padding-left: 0 !important;
    padding-right: 0 !important;
}
</style>