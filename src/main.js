import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // ✅ Import the router from the router folder
import { createPinia } from 'pinia';
import 'vue-toastification/dist/index.css';

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount('#app');
