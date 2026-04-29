<template>
  <AuthLayout>
    <AuthCard>
      <AuthHeader title="Crie sua nova senha" subtitle="Digite e confirme sua nova senha para acessar sua conta">

        <template #logo>
          <img :src="MedConnectLogo" alt="MedConnect Logo">
        </template>
      </AuthHeader>
      <form class="auth-form" @submit.prevent="resetarSenha">
        <div class="form-container">
          <!--Input nova senha-->
          <InputField
            :type="mostrarSenha ? 'text' : 'password'"
            v-model="novaSenha"
            placeholder="Digite sua nova senha"
            id="novaSenha"
            :minlength="6"
            :required="true"
            :left-icon="LockKeyholeIcon"
            :right-icon="mostrarSenha ? Eye : EyeOff"
            @toggle="toggleSenha"
          />
          <!--calcular força da senha-->
          <PasswordRequirements :model-value="novaSenha" @valid="senhaValida = $event" />
          <!--Input confirmar senha-->
          <InputField
            :type="mostrarSenha2 ? 'text' : 'password'"
            v-model="confirmarSenha"
            placeholder="Confirme sua nova senha"
            id="novaSenha"
            :minlength="6"
            :required="true"
            :left-icon="LockKeyholeIcon"
            :right-icon="mostrarSenha2 ? Eye : EyeOff"
            @toggle="toggleSenha2"
          />
          <!--Botão redefinir-->
          <BaseButton type="submit" :loading="carregando">
           <Loader2Icon
              class="spinner"
              v-if="carregando"
              :size="14"
              :stroke-width="2"
            />
            {{ carregando ? "Redefinindo" : "Redefinir senha" }}
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
</style>

<script setup lang="ts">
//Biblioteca notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//imports vue
import { onMounted, ref, computed} from "vue"; //onMounted: executar código quando o componente carrega

//imports vue-router
import { useRouter, useRoute } from "vue-router"; //useRouter: redirecionar | useRoute: pegar o token da URL

//api backend
import api from "../services/api";

//Layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthCard from "../layouts/AuthCard.vue";
import AuthHeader from "../layouts/AuthHeader.vue";

//components
import InputField from "../components/ui/InputField.vue";
import PasswordRequirements from "../components/ui/PasswordRequirements.vue";
import BaseButton from "../components/ui/BaseButton.vue";

//Lucide icons
import {
  Eye,
  EyeOff,
  LockKeyholeIcon,
  Loader2Icon,
} from "@lucide/vue";

//imagens
import MedConnectLogo from '@/assets/medconnect-logo-name.png'

//variáveis reativas
const token = ref("");
const novaSenha = ref("");
const confirmarSenha = ref("");
const carregando = ref(false);
const mostrarSenha = ref(false);
const mostrarSenha2 = ref(false);
const temMaiuscula = ref(false);
const temNumeros = ref(false);
const temEspeciais = ref(false);
const tamanhoMinSenha = ref(false);

//juntando todas as validações com o computed
const senhaValida = computed(() => {
  return (
    temMaiuscula.value &&
    temNumeros.value &&
    temEspeciais.value &&
    tamanhoMinSenha.value
  );
});

const router = useRouter(); //navegar entre páginas
const route = useRoute(); //acessar informações da URL

onMounted(() => {
  //extraindo o token da URL, atribuindo a variavel token e transformando em string
  token.value = String(route.query.token || "");
  if (!token.value) {
    console.log("Erro: Token inválido");
  }
});

const resetarSenha = async () => {
  if (!token.value) {
    console.log("Token não encontrado");
    return;
  }

  if (!novaSenha.value) {
    toast.warning("Digite uma nova senha");
    return;
  }

  if (novaSenha.value.length < 6) {
    toast.error("Senha deve ter no mínimo 6 caracteres");
    return;
  }

  if (confirmarSenha.value !== novaSenha.value) {
    toast.error("As senhas não coincidem");
    return;
  }

  carregando.value = true;

  try {
    const { data } = await api.post(
      "/auth/reset-password",
      {
        token: token.value,
        novaSenha: novaSenha.value,
      },
      {
        skipAuthRedirect: true,
      },
    );
    //toast de sucesso
    toast.success(`${data.mensagem} Redirecionando em 3 segundos...`, {
      autoClose: 3000,
    });

    //aguarda 3s para redirecionar
    setTimeout(() => {
      router.push("login");
    }, 3000);
  } catch (error: any) {
    toast.error(error.response?.data?.erro || "Erro ao resetar senha");
  } finally {
    carregando.value = false;
  }
};

/* Mostrar senha input 1 */
const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};

//mostrar senha input 2
const toggleSenha2 = () => {
  mostrarSenha2.value = !mostrarSenha2.value;
};
</script>
