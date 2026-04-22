<template>
  <form @submit.prevent="resetarSenha">
    <h1>Redefinir senha</h1>
    <!--Input nova senha-->
    <input
      v-model="novaSenha"
      :type="mostrarSenha ? 'text' : 'password'"
      placeholder="Digite sua nova senha"
      @input="calcularForcaSenha"
    />

    <!--Input confirmar senha-->
    <input
      :type="mostrarSenha ? 'text' : 'password'"
      placeholder="Confirme sua nova senha"
      v-model="confirmarSenha"
    />

    <!--calcular força da senha-->
    <div v-if="novaSenha">
      <span :class="'senha-' + forcaSenha">{{ forcaSenha }}</span>
    </div>

    <!--botão mostrar senha-->
    <button type="button" @click="mostrarSenha = !mostrarSenha">
      {{ mostrarSenha ? "Ocultar" : "Mostrar" }}
    </button>

    <!--Botão redefinir-->
    <button type="submit" :disabled="carregando">
      {{ carregando ? "Redefinindo" : "Redefinir senha" }}
    </button>
  </form>
  <div v-if="mensagemErro">{{ mensagemErro }}</div>
  <div v-if="mensagem">{{ mensagem }}</div>
  <div v-if="mensagem && contadorRedirect > 0">
    Redirecionando em...{{ contadorRedirect }}
  </div>
</template>

<style scoped>
/* Estilos base do formulário */
form {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Mensagens de feedback */
.mensagem-erro {
  color: red;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffe6e6;
  border-radius: 4px;
}

.mensagem {
  color: green;
  margin-top: 10px;
  padding: 10px;
  background-color: #e6ffe6;
  border-radius: 4px;
}

/* Cores para força da senha */
.senha-Fraca {
  color: red;
  font-weight: bold;
}

.senha-Média {
  color: orange;
  font-weight: bold;
}

.senha-Forte {
  color: green;
  font-weight: bold;
}
</style>

<script setup>
import { onMounted, ref } from "vue"; //onMounted: executar código quando o componente carrega
import { useRouter, useRoute } from "vue-router"; //useRouter: redirecionar | useRoute: pegar o token da URL
import api from "../services/api";

//variáveis
const token = ref("");
const novaSenha = ref("");
const confirmarSenha = ref("");
const mensagem = ref("");
const mensagemErro = ref("");
const carregando = ref(false);
const mostrarSenha = ref(false);
const forcaSenha = ref("");
const contadorRedirect = ref(3);

const router = useRouter(); //navegar entre páginas
const route = useRoute(); //acessar informações da URL

onMounted(() => {
  //extraindo o token da URL, atribuindo a variavel token e transformando em string
  token.value = String(route.query.token || "");
  if (!token.value) {
    console.log("Erro: Token inválido");
  }
});

//calculando força da senha
const calcularForcaSenha = () => {
  const tamanho = novaSenha.value.length;

  const temLetras = /[a-zA-Z]/.test(novaSenha.value);
  const temNumeros = /[0-9]/.test(novaSenha.value);
  const temEspeciais = /[!@#$%^&*]/.test(novaSenha.value);

  //.test() retorna true se encontrar o padrão e false se não encontrar

  if (tamanho < 6) {
    forcaSenha.value = "Fraca";
  } else if (tamanho >= 8 && temLetras && temNumeros && temEspeciais) {
    forcaSenha.value = "Forte";
  } else {
    forcaSenha.value = "Média";
  }
};

const resetarSenha = async () => {
  mensagem.value = "";
  mensagemErro.value = "";

  if (!token.value) {
    console.log("Token não encontrado");
    return;
  }

  if (!novaSenha.value) {
    mensagemErro.value = "Digite uma nova senha";
    return;
  }

  if (novaSenha.value.length < 6) {
    mensagemErro.value = "Senha deve ter no mínimo 6 caracteres";
    return;
  }

  if (confirmarSenha.value !== novaSenha.value) {
    mensagemErro.value = "As senhas não coincidem";
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

    mensagem.value = reposta.data.mensagem;

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
  } catch (error) {
    mensagemErro.value = error.response?.data?.erro || "Erro ao resetar senha";
  } finally {
    carregando.value = false;
  }
};
</script>
