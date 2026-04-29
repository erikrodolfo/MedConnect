<script setup lang="ts">
//biblioteca notificação
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//imports vue
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

//lucide icons
import { Mail, LockKeyholeIcon, Eye, EyeOff, Loader2Icon } from "@lucide/vue";

//componentes
import InputField from "../components/ui/InputField.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseLink from "../components/ui/BaseLink.vue";
import BaseCheckbox from "../components/ui/BaseCheckbox.vue";

//layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthCard from "../layouts/AuthCard.vue";
import AuthHeader from "../layouts/AuthHeader.vue";

// notificações
import "@/styles/notifications/index.css";
import "@/styles/notifications/notification-tablet.css";

//imagens
import MediConnectLogo from "../assets/medconnect-logo-name.png";

//api backend
import api from "../services/api";

const router = useRouter();

const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);
const lembrarMe = ref(false);
const isDesktop = ref(window.innerWidth >= 768);
const title = computed(() => isDesktop.value ? "Bem vindo de volta" : "Login")
const carregando = ref(false);

const fazerLogin = async () => {
  carregando.value = true;

  const dados = {
    email: email.value,
    senha: senha.value,
  };

  try {
    const { data } = await api.post("/auth/login", dados);

    //salvando o login no localstorage caso o usuário queira
    const storage = lembrarMe.value ? localStorage : sessionStorage;

    //salvando a chave de acesso
    storage.setItem("token", data.token);

    //salvando o crachá e convertendo o objeto em string para o navegador conseguir guardar
    storage.setItem("usuario", JSON.stringify(data.usuario));

    //redirecionamento
    if (data.usuario.role === "ADMIN") {
      router.push("/admin/dashboard");
      return;
    } else {
      router.push("/dashboard");
    }
    toast.success("Login feito com sucesso");
  } catch (erro: any) {
    console.error(erro);
    if (erro.response && erro.response.data && erro.response.data.erro) {
      toast.error(erro.response.data.erro);
      return;
    } else {
      toast.error("Erro de conexão com o servidor");
    }
  } finally {
    carregando.value = false;
  }
};

const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};
</script>

<template>
  <AuthLayout>
    <AuthCard>
      <!-- Header Mobile -->
      <AuthHeader
        :title="title"
        subtitle="Acesse sua conta para gerenciar seus agendamentos"
      >
        <template #logo>
          <img :src="MediConnectLogo" alt="logo MedConnect" />
        </template>
      </AuthHeader>


      <form @submit.prevent="fazerLogin" class="auth-form">
        <div class="form-container">
          <!--Input email-->
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
          <div class="remember-forgot-wrapper">
            <!--Lembrar me-->
            <BaseCheckbox v-model="lembrarMe"> Lembrar-me </BaseCheckbox>
            <!--Botão ir para recuperação-->
            <BaseLink class="forgot-password-desktop" v-if="isDesktop" to="/forgot-password">
              Esqueci minha senha</BaseLink
            >
          </div>

          <!--Botao entrar-->
          <BaseButton type="submit" :loading="carregando">
            <Loader2Icon
              v-if="carregando"
              :size="14"
              :stroke-width="2"
              class="spinner"
            />
            {{ carregando ? "Entrando" : "Entrar" }}
          </BaseButton>

          <div class="baselink-container">
            <!--Crie uma conta-->
            <p class="text-muted">
              Ainda não possui conta?
              <BaseLink to="/cadastro-step1">Crie uma</BaseLink>
            </p>
            <!--Ir para recuperação para mobile-->
            <BaseLink to="/forgot-password" v-if="!isDesktop">
              Esqueci minha senha
            </BaseLink>
          </div>
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
/* Container do BaseLink */
/* não possui conta */
.baselink-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-muted {
  color: var(--color-text-secondary);
}

@media screen and (min-width: 768px){
  .remember-forgot-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .forgot-password-desktop {
    width: 100%;
  }
  
}
</style>
