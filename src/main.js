import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




const app = createApp(App);

app.use(vuetify)
app.use(router);
app.mount('#app');
