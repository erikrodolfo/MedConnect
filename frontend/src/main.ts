import { createApp } from "vue";

import App from "./App.vue";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import { createVfm } from "vue-final-modal";
import 'vue-final-modal/style.css'
import router from "./router";
import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/components.css";
import "./style.css";

const app = createApp(App); //instãncia da aplicação

const vfm = createVfm();

app.use(vfm);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "top-center",
} as ToastContainerOptions);

app.mount("#app");
