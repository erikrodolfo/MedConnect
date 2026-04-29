import { createApp } from "vue";

import App from "./App.vue";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import { createPinia } from "pinia";
import { createVfm } from "vue-final-modal";
import 'vue-final-modal/style.css'
import router from "./router";
import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/components.css";
import "./style.css";

const isMobile = window.innerWidth <= 768

const app = createApp(App); //instãncia da aplicação

app.use(createPinia())

const vfm = createVfm();

app.use(vfm);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  closeButton: !isMobile,
  position: isMobile ? 'top-center' : 'bottom-right',
  toastStyle: {
    width: isMobile ? '85vw' : 'auto'
  }
} as ToastContainerOptions);

app.mount("#app");
