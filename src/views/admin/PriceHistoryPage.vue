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
                        <v-text-field v-model="search" append-icon="mdi-magnify" label="Ara" single-line hide-details />
                    </v-card-title>

                    <v-data-table dense :headers="headers" :items="filteredPriceChanges" class="elevation-1">
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>{{ item.productName }}</td>
                                <td>{{ item.created }}</td>
                                <td>{{ item.creator }}</td>
                                <td>
                                    <v-btn @click="openTimelineModal(item)" color="primary" small>
                                        Göster
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>

                    <v-dialog v-model="isModalOpen" max-width="50%">
                        <v-card class="modal-card">
                            <v-card-title class="modal-title">
                                <span class="headline" style="float: left;">{{ selectedProduct?.productName }}</span>
                                <v-btn icon @click="isModalOpen = false" style="float: right;">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text class="modal-content">
                                <v-timeline>
                                    <template v-for="change in selectedProduct?.priceChanges" :key="change.id">
                                        <v-timeline-item>
                                            <v-card class="timeline-card">
                                                <v-card-title>{{ change.productName }}</v-card-title>
                                                <v-card-subtitle>
                                                    <strong>Satış Fiyatı:</strong> {{ change.oldSalePrice }}
                                                    <strong>Eski Alış Fiyatı:</strong> {{ change.oldSalePrice }}
                                                    <strong>Yeni Alış Fiyatı:</strong> {{ change.currentSalePrice }}
                                                </v-card-subtitle>
                                                <v-card-text>
                                                    Değişiklik Tarihi: {{ change.changeDate }}
                                                </v-card-text>
                                                <v-card-text>
                                                    <strong>Kâr/Zarar Durumu:</strong>
                                                    {{ calculateProfitLoss(change.currentSalePrice, change.costPrice) }}
                                                </v-card-text>
                                            </v-card>
                                        </v-timeline-item>
                                    </template>
                                </v-timeline>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </v-card>
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
    name: 'PriceChangeReport',
    components: {
        ToolbarChip,
        ParentComponent,
    },
    data() {
        return {
            priceChanges: [],
            search: '',
            headers: [
                { key: 'productName', title: 'Ürün Adı' },
                { key: 'created', title: 'Değişiklik Tarihi' },
                { key: 'creator', title: 'Değiştiren' },
                { key: 'actions', title: 'Aksiyonlar' },
            ],
            pageName: "Fiyat Değişim Raporu",
            isModalOpen: false,
            selectedProduct: null,
        };
    },
    computed: {
        filteredPriceChanges() {
            return this.priceChanges.filter(change =>
                change.productName && change.productName.toLowerCase().includes(this.search.toLowerCase())
            );
        },
    },
    methods: {
        getPriceChanges() {
            axios.get(`${config.apiBaseUrl}/ProductService`)
                .then(response => {
                    this.priceChanges = response.data.data.map(item => ({
                        ...item,
                        priceChanges: []
                    }));
                })
                .catch(error => {
                    console.error('Fiyat değişikliği verisi alınırken hata:', error);
                });
        },
        openTimelineModal(item) {
            this.selectedProduct = item;
            this.isModalOpen = true;

            if (item.priceChanges.length === 0) {
                axios.get(`${config.apiBaseUrl}/PriceHistoryService/${item.id}`)
                    .then(response => {
                        this.selectedProduct.priceChanges = response.data.data;
                    })
                    .catch(error => {
                        console.error('Fiyat değişiklikleri alınırken hata:', error);
                    });
            }
        },
        calculateProfitLoss(currentSalePrice, costPrice) {
            const profitLoss = currentSalePrice - costPrice;

            if (profitLoss > 0) {
                return `Kâr: ${profitLoss.toFixed(2)} TL`;
            } else if (profitLoss < 0) {
                return `Zarar: ${Math.abs(profitLoss).toFixed(2)} TL`;
            } else {
                return 'Ne Kâr Ne Zarar';
            }
        },
    },
    mounted() {
        this.getPriceChanges();
    },
};
</script>


<style scoped>
.no-padding {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

.elevation-1 {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
