<template>
  <div class="login-page">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo-wrapper">
          <img :src="MediConnectLogo" alt="logo" />
        </div>
        <h1 class="title-mobile">Login</h1>
        <h1 class="title-desktop">Bem vindo de volta!</h1>
        <p class="subtittle">
          Acesse sua conta para gerenciar seus agendamentos
        </p>
        <form @submit.prevent="fazerLogin" class="login-form">
          <div class="input-container">
            <InputField
              v-model="email"
              type="email"
              placeholder="Digite seu email"
              name="email"
              id="email"
              :required="true"
              autocomplete
              :left-icon="Mail"
            />

            <!-- Input Senha -->
            <InputField
              v-model="senha"
              type="password"
              placeholder="Digite sua senha"
              name="senha"
              id="senha"
              :required="true"
              :minlength="6"
              :left-icon="LockKeyholeIcon"
              :right-icon="mostrarSenha ? Eye : EyeOff"
              :show-password="mostrarSenha"
              @toggle="toggleSenha"
            />
          </div>
          <div class="remember-forgot-wrapper">
            <div class="remember-me-wrapper">
              <input
                type="checkbox"
                v-model="lembrarMe"
                name="remember"
                id="remember"
                class="esconder-visual"
              />
              <label for="remember" class="checkbox-label">Lembrar-me</label>
            </div>
            <button
              @click="irParaRecuperacao"
              type="button"
              v-if="isDesktop"
              class="forgot-password-desktop forgot-password"
            >
              Esqueci minha senha
            </button>
          </div>
          <button type="submit" class="login-button">Entrar</button>
        </form>
        <p class="no-account-text">
          Ainda não possui conta?
          <button @click="cadastrar" id="cadastrar" class="register-text">
            Crie uma
          </button>
        </p>
        <button
          @click="irParaRecuperacao"
          type="button"
          v-if="!isDesktop"
          class="forgot-password"
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
    <!--Imagem-->
    <div class="hero-page">
      <img :src="MedicoImg" alt="Médico" class="hero-image" />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Mail, LockKeyhole, LockKeyholeIcon, Eye, EyeOff } from "@lucide/vue";
import InputField from "../components/InputField.vue";
//arquivos de estilo
import "@/styles/pages/auth/login-page/mobile.css";
import "@/styles/pages/auth/login-page/tablet.css";
import "@/styles/pages/auth/login-page/desktop.css";

//imagens
import MedicoImg from "../assets/medico.svg";
import MediConnectLogo from "../assets/medConnect-logo.svg";
import api from "../services/api";

const router = useRouter();

const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);
const lembrarMe = ref(false);
const isDesktop = ref(window.innerWidth >= 768);

const fazerLogin = async () => {
  const dados = {
    email: email.value,
    senha: senha.value,
  };

  try {
    const { data } = await api.post("/auth/login", dados);

    //salvando o login no localstorage caso o usuário queira
    const storage = lembrarMe.value ? localStorage : sessionStorage;

    //salvando a chave de acesso
    localStorage.setItem("token", data.token);

    //salvando o crachá e convertendo o objeto em string para o navegador conseguir guardar
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    //redirecionamento
    if (data.usuario.role === "ADMIN") {
      router.push("/admin/dashboard");
      return;
    } else {
      router.push("/dashboard");
    }
    toast.success("Login feito com sucesso");
  } catch (erro) {
    console.error(erro);
    if (erro.response && erro.response.data && erro.response.data.erro) {
      toast.error(erro.response.data.erro);
      return;
    } else {
      toast.error("Erro de conexão com o servidor");
    }
  }
};

const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};

const cadastrar = () => router.push("/cadastro-step1");

const irParaRecuperacao = () => {
  router.push("/forgot-password");
};
</script>
