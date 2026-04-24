<template>
  <div class="cadastro-page">
    <div class="cadastro-card">
      <div class="logo-wrapper">
          <img :src="MediConnectLogo" alt="logo" />
        </div>
      <div class="barra-wrapper">
        <div class="barra1" :style="{ '--progress': progresso + '%' }">
          <!--Content 1-->
        </div>
        <div class="barra2">
          <!--Content 2-->
        </div>
      </div>
      <h1>Criar conta</h1>
      <p class="subtittle">
        Crie sua conta para começar a agendar suas consultas
      </p>
      <form @submit.prevent="cadastrarUsuario" class="cadastro-form">
        <div class="input-container">
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
          <Transition name="slide-fade">
            <div v-if="senha" class="requisitos-senha">
              <p :class="{ 'senha-ok': senhaValida }">
                <component
                  :is="senhaValida ? CircleCheckBig : CircleAlertIcon"
                  :size="14"
                  :stroke-width="2"
                />
                {{ !senhaValida ? 'Sua senha deve atender a todos os requisitos abaixo.' : 'Sua senha atende a todos os requisitos.' }}
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
        </div>
        <button class="cadastro-button" type="submit">Próximo</button>
      </form>
      <p class="have-an-account-text">
        Já possui login?
        <button @click="entrar" class="login-text" id="entrar">Entrar</button>
      </p>
    </div>
    <div class="cadastro-hero-page">
      <div class="cadastro-hero-card">
        <img :src="MedicoImg" class="hero-image" alt="Medico">
      </div>
    </div>
  </div>
</template>

<style scoped>
.cadastro-card .barra-wrapper {
  width: 87%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 auto 10px auto;
  padding-top: 20px;
  gap: 7px;
}

.barra-wrapper .barra1 {
  width: auto;
  height: 7px;
  background-color: var(--color-primary-light);
  border-radius: 10px;
  animation: progress-bar 1s forwards;
  background-size: 200% 100%;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.barra-wrapper .barra1::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress, 0%);
  background-color: var(--color-primary);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
}

.barra-wrapper div:nth-child(2) {
  width: auto;
  height: 7px;
  background-color: var(--color-primary-light);
  border-radius: 10px;
}

p {
  transition: all 1s ease;
}

p.senha-ok, .senha-ok svg {
  color: var(--color-success);
}
</style>

<!--Inicio Script-->

<script setup lang="ts">
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css'
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Mail,
  LockKeyholeIcon,
  Eye,
  EyeOff,
  User,
  CircleCheck,
  CircleX,
  CircleAlertIcon,
  CircleCheckBig,
} from "@lucide/vue";
import InputField from "../components/InputField.vue";
import MedicoImg from "../assets/medico.svg";
import MediConnectLogo from "../assets/medConnect-logo.svg"

/* Arquivos de estilos */
import "@/styles/pages/auth/cadastro-page/mobile-shared.css";
import "@/styles/pages/auth/cadastro-page/tablet.css"

const nome = ref("");
const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    toast.error("Digite um email válido");
    return;
  }

  const dados = {
    nome: nome.value,
    email: email.value,
    senha: senha.value,
  };

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
    nome.value.trim() !== '',
   email.value.includes("@"),
   senhaValida.value]

  const preenchidos = campos.filter(Boolean).length //filtra apenas os valores verdadeiros e conta quantos são

  return (preenchidos / campos.length) * 100
}
)

watch(senha, (novaSenha) => {
  temMaiuscula.value = /[A-Z]/.test(novaSenha);
  temNumeros.value = /[0-9]/.test(novaSenha);
  temEspeciais.value = /[!@#$%^&*]/.test(novaSenha);
  tamanhoMinSenha.value = novaSenha.length >= 8;
});

//rota para entrar na tela de login
const entrar = () => router.push("/login");
</script>
