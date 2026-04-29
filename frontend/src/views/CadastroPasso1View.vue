<!--Inicio Script-->
<script setup lang="ts">
//biblioteca notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//imports vue
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

//lucide icons
import { Mail, LockKeyholeIcon, Eye, EyeOff, User } from "@lucide/vue";

//layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthProgress from "../layouts/AuthProgress.vue";
import AuthHeader from "../layouts/AuthHeader.vue";
import AuthCard from "../layouts/AuthCard.vue";

//components
import InputField from "../components/ui/InputField.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseLink from "../components/ui/BaseLink.vue";
import PasswordRequirements from "../components/ui/PasswordRequirements.vue";

//imagens
import MediConnectLogo from "../assets/medconnect-logo-name.png";

//variáveis reativas
const nome = ref("");
const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);
const senhaValida = ref(false);

//roteador
const router = useRouter();

//função cadastrar usuario
const cadastrarUsuario = () => {
  if (!nome.value || !email.value || !senha.value) {
    toast.error("Preenchas todos os campos.");
    return;
  }

  //validando se todos os requisitos estão sendo cumpridos
  if (!senhaValida.value) {
    toast.warning("A senha precisa cumprir todos os requisitos.");
    return;
  }

  //validando o email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    toast.error("Digite um email válido");
    return;
  }

  //pegando todos os dados
  const dados = {
    nome: nome.value,
    email: email.value,
    senha: senha.value,
  };

  //eviando os dados para o cadastro passo 2
  router.push({
    path: "/cadastro-step2",
    state: {
      ...dados, //espalhando os dados com o spread(...)
    },
  });
};

//função mostrar senha
const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};

//funçãopara barra de progresso reativa
const progresso = computed(() => {
  //pegando e validando os dados
  const campos = [
    nome.value.trim() !== "",
    email.value.includes("@"),
    senhaValida.value,
  ];

  const preenchidos = campos.filter(Boolean).length; //filtra apenas os valores verdadeiros e conta quantos são

  return (preenchidos / campos.length) * 100;
});
</script>
<!-- Fim script -->

<!-- Início Template -->
<template>
  <AuthLayout>
    <AuthCard>
      <AuthProgress :step="1" :progress="progresso" />
      <AuthHeader
        title="Criar conta"
        subtitle="Crie sua conta para começar a agendar suas consultas"
      >
        <!-- Logo -->
        <template #logo>
          <img :src="MediConnectLogo" alt="MedConnect Logo" />
        </template>
      </AuthHeader>
      <form class="auth-form" @submit.prevent="cadastrarUsuario">
        <div class="form-container">
          <!--Input nome-->
          <InputField
            v-model="nome"
            type="text"
            placeholder="Nome completo"
            name="nome"
            id="nome"
            :required="true"
            autocomplete="on"
            :left-icon="User"
          />
          <!--Input email-->
          <InputField
            v-model="email"
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            :required="true"
            autocomplete
            :left-icon="Mail"
          />
          <!--Input senha-->
          <InputField
            v-model="senha"
            type="password"
            placeholder="Senha"
            name="senha"
            id="senha"
            :minlength="6"
            :required="true"
            :left-icon="LockKeyholeIcon"
            :right-icon="mostrarSenha ? Eye : EyeOff"
            :show-password="mostrarSenha"
            @toggle="toggleSenha"
          />
          <!--calcular força da senha-->
          <PasswordRequirements
            :model-value="senha"
            @valid="senhaValida = $event"
          />
          <!-- Botão Entrar -->
          <BaseButton type="submit">Proximo</BaseButton>
          <!--Já tem login-->
          <p class="have-an-account-text">
            Já possui login?
            <BaseLink to="/login">Entrar</BaseLink>
          </p>
        </div>
      </form>
    </AuthCard>
  </AuthLayout>
</template>
<!-- Fim Template -->

<!-- Início Styles -->
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
</style>
<!-- Fim Styles -->
