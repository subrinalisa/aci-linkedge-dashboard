import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Vue3Toastify from 'vue3-toastify';
import VueApexCharts from "vue3-apexcharts";
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import { createPinia } from "pinia";
import { createApp } from "vue";

import Antd from "ant-design-vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/css/style.scss";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(router).use(Antd).use(pinia).use(VueApexCharts).use(Vue3Toastify).use(VueSidebarMenu).mount("#app");
