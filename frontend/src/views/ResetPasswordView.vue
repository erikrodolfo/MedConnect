<template>
  <div class="reset-password-page">
    <div class="reset-password-card">
      <h1>Crie sua nova senha</h1>
      <p class="subtittle">
        Digite e confirme sua nova senha para acessar sua conta.
      </p>
      <form class="reset-password-form" @submit.prevent="resetarSenha">
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
        <!--Input confirmar senha-->
            <InputField
          :type="mostrarSenha ? 'text' : 'password'"
          v-model="confirmarSenha"
          placeholder="Confirme sua nova senha"
          id="novaSenha"
          :minlength="6"
          :required="true"
          :left-icon="LockKeyholeIcon"
           :right-icon="mostrarSenha ? Eye : EyeOff"
          @toggle="toggleSenha"
        />

        <!--calcular força da senha-->
        <Transition name="slide-fade">
          <div v-if="novaSenha" class="requisitos-senha">
            <p :class="{ 'senha-ok': senhaValida }">
              <component
                :is="senhaValida ? CircleCheckBig : CircleAlertIcon"
                :size="14"
                :stroke-width="2"
              />
              {{
                !senhaValida
                  ? "Sua senha deve atender a todos os requisitos abaixo."
                  : "Sua senha atende a todos os requisitos."
              }}
            </p>
            <ul>
              <!--Tem maiúscula-->
              <li :class="{ valido: temMaiuscula }">
                <component
                  :is="temMaiuscula ? CircleCheck : CircleX"
                  :size="14"
                />
                1 letra maiúscula
              </li>

              <!--Tem número-->
              <li :class="{ valido: temNumeros }">
                <component
                  :is="temNumeros ? CircleCheck : CircleX"
                  :size="14"
                />
                1 número
              </li>

              <!--Tem caractere especial-->
              <li :class="{ valido: temEspeciais }">
                <component
                  :is="temEspeciais ? CircleCheck : CircleX"
                  :size="14"
                />
                1 caractere especial
              </li>

              <!--Mínimo 8 caracteres-->
              <li :class="{ valido: tamanhoMinSenha }">
                <component
                  :is="tamanhoMinSenha ? CircleCheck : CircleX"
                  :size="14"
                />
                Mínimo 8 caracteres
              </li>
            </ul>
          </div>
        </Transition>
        
        <!--Botão redefinir-->
        <button class="reset-password-button" type="submit" :disabled="carregando">
          {{ carregando ? "Redefinindo" : "Redefinir senha" }}
        </button>
      </form>
      <div v-if="mensagem">{{ mensagem }}</div>
      <div v-if="mensagem && contadorRedirect > 0">
        Redirecionando em...{{ contadorRedirect }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { onMounted, ref, computed, watch } from "vue"; //onMounted: executar código quando o componente carrega
import { useRouter, useRoute } from "vue-router"; //useRouter: redirecionar | useRoute: pegar o token da URL
import api from "../services/api";
import '@/styles/pages/auth/reset-password-page/mobile.css'
import InputField from "../components/InputField.vue";
import {
  Eye,
  EyeOff,
  LockKeyholeIcon,
  CircleCheck,
  CircleX,
  CircleAlertIcon,
  CircleCheckBig,
} from "@lucide/vue";

//variáveis
const token = ref("");
const novaSenha = ref("");
const confirmarSenha = ref("");
const mensagem = ref("");
const carregando = ref(false);
const mostrarSenha = ref(false);
const contadorRedirect = ref(3);
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
    const reposta = await api.post(
      "/auth/reset-password",
      {
        token: token.value,
        novaSenha: novaSenha.value,
      },
      {
        skipAuthRedirect: true,
      },
    );

    toast.info(reposta.data.mensagem);

    contadorRedirect.value = 3;

    //Decrementa a cada 1 segundo
    const intervalo = setInterval(() => {
      contadorRedirect.value--;

      //quando chegar a 0, redirecionar
      if (contadorRedirect.value === 0) {
        clearInterval(intervalo); //para o intervalo
        router.push("/login");
      }
    }, 1000);
  } catch (error: any) {
    toast.error(error.response?.data?.erro || "Erro ao resetar senha");
  } finally {
    carregando.value = false;
  }
};

watch(novaSenha, (novaSenha) => {
  temMaiuscula.value = /[A-Z]/.test(novaSenha);
  temNumeros.value = /[0-9]/.test(novaSenha);
  temEspeciais.value = /[!@#$%^&*]/.test(novaSenha);
  tamanhoMinSenha.value = novaSenha.length >= 8;
});

/* Mostrar senha */
const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};
</script>
