import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import router from "./router";
import { createPinia } from "pinia";
import axios from "axios";

const app = createApp(App);
const pinia = createPinia();

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });
  
  app
    .use(pinia)
    .use(router)
    .provide('axios', axiosInstance)          // Composition API용
    .mount('#app');
