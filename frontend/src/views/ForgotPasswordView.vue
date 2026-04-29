<script setup>
//Biblioteca notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//imports vue
import { ref } from "vue";
import { useRouter } from "vue-router";

//api backend
import api from "../services/api";

//layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthCard from "../layouts/AuthCard.vue";
import AuthHeader from "../layouts/AuthHeader.vue";

//components
import InputField from "../components/ui/InputField.vue";
import BaseButton from "../components/ui/BaseButton.vue";

//Lucide icons
import { Mail, Loader2Icon } from "@lucide/vue";

//imagens
import MedConnectLogo from '@/assets/medconnect-logo-name.png'

//variáveis reativas
const email = ref("");
const carregando = ref(false);

//roteador
const router = useRouter();

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

<template>
  <AuthLayout>
    <AuthCard>
      <AuthHeader
        title="Redefinir senha"
        subtitle="Digite seu e-mail para receber o link de recuperação">
      <template #logo>
        <img :src="MedConnectLogo" alt="MedConnect Logo">
      </template>
      </AuthHeader>
      <!-- Formulário -->
      <form class="auth-form" @submit.prevent="solicitarRecuperacao">
        <div class="form-container">
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
          <!--Botão enviar link-->
          <BaseButton type="submit" :loading="carregando">
            <Loader2Icon
              v-if="carregando"
              :size="14"
              :stroke-width="2"
              class="spinner"
            />
            {{ carregando ? "Enviando..." : "Enviar Link" }}
          </BaseButton>
          <!--Botão voltar para o login-->
          <BaseButton
            class="button-voltar-login"
            type="button"
            @click="voltarlogin"
          >
            Voltar para o login
          </BaseButton>
        </div>
      </form>
    </AuthCard>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
  align-items: center;
}

.button-voltar-login {
  background-image: linear-gradient(
    45deg,
    var(--color-background),
    var(--color-surface)
  );
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.button-voltar-login:hover {
  background-image: linear-gradient(
    45deg,
    var(--color-primary-lighter),
    var(--color-surface)
  );
}
</style>
