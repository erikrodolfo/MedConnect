import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import CadastroPasso1View from "../views/CadastroPasso1View.vue";
import CadastroPasso2View from "../views/CadastroPasso2View.vue";
//import DashboardView from "../views/DashboardView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import EmDesenvolvimento from "../views/EmDesenvolvimento.vue";

// Rotas
const routes = [
  {
    path: "/",
    redirect: () => { //se o usuário tiver um token guardado no localStorage ou no SessionStorage
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      return token ? "/dashboard" : "/login"; //redireciona para o dashboard, se não, redireciona pro login
    }, 
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/cadastro-step1",
    name: "CadastroPasso1",
    component: CadastroPasso1View,
  },
  {
    path: "/cadastro-step2",
    name: "CadastroPasso2",
    component: CadastroPasso2View,
  },
  {
    path: "/dashboard",
    redirect: "/em-desenvolvimento",
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: () => import("../views/DashboardAdmin.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/forgot-password",
    component: ForgotPasswordView,
  },
  {
    path: "/reset-password",
    component: ResetPasswordView,
  },
  {
    path: "/em-desenvolvimento",
    name: "EmDesenvolvimento",
    component: EmDesenvolvimento,
  },
];

const router = createRouter({
  history: createWebHistory(), //usa o histórico padrão do navegador
  routes: routes, //passa o array com as rotas
});

//navigation guard
router.beforeEach((to) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const usuarioInfo =
    localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
  const perfilUsuario = usuarioInfo ? JSON.parse(usuarioInfo).role : null;

  if (to.meta.requiresAuth && !token) {
    return "/login";
  }

  if (to.meta.requiresAdmin && perfilUsuario !== "ADMIN") {
    return "/dashboard";
  }

  return true; //permite continuar
});
export default router;
