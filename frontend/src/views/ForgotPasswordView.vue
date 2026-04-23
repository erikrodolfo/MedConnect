<template>
  <div class="forgot-password-page">
    <div class="forgot-password-card">
      <h1>Redefinir senha</h1>
      <p class="subtittle">
        Digite seu e-mail para receber o link de recuperação
      </p>
      <form class="forgot-password-form" @submit.prevent="solicitarRecuperacao">
        <InputField
          v-model="email"
          type="email"
          id="email"
          name="email"
          placeholder="Digite seu email"
          :required="true"
          autocomplete
          :left-icon="Mail"
        />
        <button
          class="forgot-password-button"
          type="submit"
          :disabled="carregando"
        >
          <Loader2Icon
            v-if="carregando"
            :size="14"
            :stroke-width="2"
            class="spinner"
          />
          {{ carregando ? "Enviando..." : "Enviar Link" }}
        </button>
        <button @click="voltarlogin" type="button" class="voltar-login-button">
          Voltar para o Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import InputField from "../components/InputField.vue";
import { Mail, Loader2Icon } from "@lucide/vue";

/* Arquivos de estilo */
import "@/styles/pages/auth/forgot-password-page/mobile.css";

const router = useRouter();

const email = ref("");
const carregando = ref(false);

const solicitarRecuperacao = async () => {
  //verificando se o email não está vazio
  if (!email.value) {
    toast.warning("Por favor, digite um email");
    return;
  }
  //verificando o formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    toast.warning("Digite um email válido");
    return;
  }

  carregando.value = true;

  try {
    //enviando email
    const enviar = await api.post(
      "/auth/forgot-password",
      {
        email: email.value,
      },
      {
        skipAuthRedirect: true,
      },
    );

    toast.info(enviar.data.mensagem); //mostra a mensagem do backend
    carregando.value = false;
  } catch (error) {
    toast.error(error.response?.data?.erro || "Erro ao enviar email");
    carregando.value = false;
  }
};

const voltarlogin = () => {
  router.push("/login");
};
</script>
