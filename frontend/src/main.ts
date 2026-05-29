import { createApp } from "vue";

import App from "./App.vue";

//toastify notifications
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";

//pinia
import { createPinia } from "pinia";

//vue modal
import { createVfm } from "vue-final-modal";
import 'vue-final-modal/style.css'

//vue router
import router from "./router";

// styles
import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/components.css";
import "./style.css";

const isMobile = window.innerWidth <= 768

const app = createApp(App); //instãncia da aplicação

app.use(createPinia()) //pinia

const vfm = createVfm(); //vue modal

app.use(vfm);
app.use(router);
app.use(Vue3Toastify, { //toastify notifications
  autoClose: 2000,
  closeButton: !isMobile,
  position: isMobile ? 'top-center' : 'bottom-right',
  toastStyle: {
    width: isMobile ? '85vw' : 'auto'
  }
} as ToastContainerOptions);

app.mount("#app");
