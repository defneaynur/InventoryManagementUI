import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import ProductPage from '../views/admin/ProductPage.vue'; //for Admin
import ProductTable from '../views/front/ProductTable.vue'; //General Page
import CategoryPage from '../views/admin/CategoryPage.vue'; //for Admin
import StockManagementPage from '../views/admin/StockManagementPage.vue'; //for Admin
import LoginPage from '../views/front/LoginPage.vue';
import PriceHistoryPage from '../views/admin/PriceHistoryPage.vue';
import StockMovementsPage from '@/views/admin/StockMovementsPage.vue';
import UserManagementPage from '@/views/admin/UserManagementPage.vue';


async function guardMyRoute(to, from, next) {
  const token = localStorage.getItem('token');
  if (token) {
    await axios.post('https://localhost:7092/api/AuthService/tokenVerify', {
      Token: token
    })
      .then(response => {
        if (response.data.coreResponseCode === 1 && response.data.data) {
          next();
        } else {
          next('/login');
        }
      })
      .catch(error => {
        console.error('Token doğrulama hatası:', error);
        next('/login');
      });
  } else {
    next('/login');
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: ProductTable
  },
  {
    path: '/login',
    name: 'loginPage',
    component: LoginPage
  },
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: guardMyRoute,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'product',
        name: 'admin-product',
        component: ProductPage
      },
      {
        path: 'category',
        name: 'admin-category',
        component: CategoryPage
      },
      {
        path: 'stockmanagement',
        name: 'admin-stockmanagement',
        component: StockManagementPage
      },
      {
        path: 'pricehistory',
        name: 'admin-pricehistory',
        component: PriceHistoryPage
      },
      {
        path: 'stockmovement',
        name: 'admin-stockmovement',
        component: StockMovementsPage
      },
      {
        path: 'usermanagement',
        name: 'admin-usermanagement',
        component: UserManagementPage
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
