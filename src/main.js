// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import axios from 'axios'

/* Vuetify 플러그인 */
import vuetify from './plugins/vuetify'  

/* axios 인스턴스 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const app = createApp(App)

app
  .use(router)
  .use(createPinia())
  .use(vuetify)                           
  .provide('axios', axiosInstance)
  .mount('#app')
