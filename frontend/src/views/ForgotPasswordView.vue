<template>
  <form @submit.prevent="solicitarRecuperacao">
    <input v-model="email" type="email" id="email" />
    <button type="submit" :disabled="carregando">
  {{ carregando ? 'Enviando...' : 'Enviar link de recuperação' }}
</button>
<RouterLink to="/login">Voltar para o login</RouterLink>
  </form>
  <div class="message">
    <div v-if="mensagemErro" class="mensagem-erro">{{ mensagemErro }}</div>
    <div v-if="mensagem" class="mensagem">{{ mensagem }}</div>
  </div>
</template>

<style scoped>
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
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

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

a {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #4CAF50;
  text-decoration: none;
}
</style>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const email = ref("");
const mensagemErro = ref("");
const mensagem = ref("");
const carregando = ref(false);

const solicitarRecuperacao = async () => {
  mensagem.value = "";
  mensagemErro.value = "";

  //verificando se o email não está vazio
  if (!email.value) {
    mensagemErro.value = "Por favor, digite um email"
    return;
  }
 //verificando o formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    alert("Digite um email válido");
    return;
  }

  carregando.value = true

  try {
    //enviando email
    const enviar = await api.post('/auth/forgot-password', {
      email: email.value
    }, {
      skipAuthRedirect: true
    })

    mensagem.value = enviar.data.mensagem //mostra a mensagem do backend
    carregando.value = false
  } catch (error) {
    mensagemErro.value = error.response?.data?.erro || 'Erro ao enviar email'    
    carregando.value = false
  }

};
</script>
