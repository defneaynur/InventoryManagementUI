import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




const app = createApp(App);

app.use(vuetify)
app.use(router);
<<<<<<< HEAD
=======
app.use(vuetify);
>>>>>>> 5324c5bdeb5609711c523a945af8f108b5b706c3
app.mount('#app');
