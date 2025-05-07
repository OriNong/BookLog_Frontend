import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import api from './services/api';
import { useAuthStore } from '@/stores/auth';

(async () => {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  const auth = useAuthStore();
  await auth.initialize(); //accessToken 세팅 보장

  app.use(router).use(vuetify).provide("axios", api);
  app.mount('#app');
})();