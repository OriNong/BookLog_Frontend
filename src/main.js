import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).mount("#app");
