<template>
  <div class="cadastro-page">
    <div class="cadastro-card">
      <div class="barra-wrapper">
        <div class="barra1"><!--Content 1--></div>
        <div class="barra2" :style="{ '--progress': progresso + '%' }">
          <!--Content 2-->
        </div>
      </div>
      <h1>Endereço</h1>
      <p class="subtittle">
        Crie sua conta para começar a agendar suas consultas
      </p>
      <form @submit.prevent="cadastrarUsuario" class="cadastro-form">
        <div class="input-container">
          <!--Input CEP-->
          <InputField
            v-model="cep"
            type="text"
            placeholder="Cep"
            name="cep"
            id="cep"
            @blur="buscarCep"
            :left-icon="Mailbox"
          />
          <!--Input logradouro-->
          <InputField
            v-model="logradouro"
            type="text"
            id="logradouro"
            name="logradouro"
            :leftIcon="MapPin"
            placeholder="Logradouro"
          />
          <!--Input número-->
          <InputField
            v-model="numero"
            type="text"
            id="numero"
            name="numero"
            :leftIcon="Hash"
            placeholder="Número"
          />

          <!--Input bairro-->
          <InputField
            v-model="bairro"
            type="text"
            id="bairro"
            name="bairro"
            :leftIcon="MapPinned"
            placeholder="Bairro"
          />
          <!--Input cidade-->
          <InputField
            v-model="cidade"
            type="text"
            id="cidade"
            name="cidade"
            :leftIcon="Building2"
            :readonly="true"
            placeholder="Cidade"
          />
        </div>
        <button class="cadastro-button" type="submit" :disabled="carregando">
          <Loader2Icon v-if="carregando" :size="14" stroke-width="2" class="spinner"/>
          {{ carregando ? 'Cadastrando' : 'Cadastrar' }}
        </button>

        <button class="voltar-button" type="button" @click="voltar">
          Voltar
        </button>
      </form>
    </div>
  </div>
</template>

<!--Início Styles-->
<style scoped>
.cadastro-card .barra-wrapper {
  width: 87%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 auto 10px auto;
  padding-top: 20px;
  gap: 5px;
}

.barra-wrapper .barra1 {
  width: auto;
  height: 7px;
  background-color: var(--color-primary);
  border-radius: 10px;
}

.barra-wrapper .barra2 {
  width: auto;
  height: 7px;
  background-color: var(--color-primary-light);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  background-size: 200% 100%;
}

.barra-wrapper .barra2::before {
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

.cadastro-card .cadastro-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  padding: 11px;
}

.cadastro-card .spinner {
  animation: spin 1s linear infinite;
}

.cadastro-card .voltar-button {
  border-radius: 20px;
  background-color: var(--color-background-alt);
  border: 1px solid var(--color-primary);
  box-shadow: rgba(201, 201, 201, 0.2) 0px 8px 24px;
  color: var(--color-primary);
  font-size: 1rem;
  font-weight: 600;
  padding: 12px;
  margin: 10px 0 30px 0;
  transition: transform 0.1s ease;
  width: 18rem;
}

.cadastro-card .voltar-button:active {
  transform: scale(0.95);
  background-color: var(--color-primary-light);
}

/* Animação botão cadastrar */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>

<!--Início Script-->

<script setup lang="ts">
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import InputField from "../components/InputField.vue";
import { Mailbox, MapPin, Hash, MapPinned, Building2, Loader2Icon } from "@lucide/vue";
import api from "../services/api";

/* Arquivos de estilos */
import "@/styles/pages/auth/cadastro-page/mobile-shared.css";

const cep = ref("");
const logradouro = ref("");
const numero = ref("");
const bairro = ref("");
const cidade = ref("");
const carregando = ref(false)
const dadosPasso1 = ref({
  nome: "",
  email: "",
  senha: "",
});

const router = useRouter(); //isso precisa vir antes de tudo

onMounted(() => {
  if (history.state && history.state.nome) {
    dadosPasso1.value = {
      nome: history.state.nome,
      email: history.state.email,
      senha: history.state.senha,
    };
  } else {
    toast.warning("Por favor, preencha todos os dados do Passo 1");
    router.push({ name: "CadastroPasso1" });
  }
});

//função buscar cep
const buscarCep = async () => {
  const cepLimpo = cep.value.replace(/\D/g, "");
  console.log("🧹 CEP limpo:", cepLimpo);

  if (cepLimpo.length === 8) {
    try {
      const resposta = await api.get(`/cep/${cepLimpo}`);
      console.log("Resposta da API:", resposta.data);

      logradouro.value = resposta.data.logradouro;
      bairro.value = resposta.data.bairro;
      cidade.value = resposta.data.localidade;

      console.log("Campos preenchidos!");
      return;
    } catch (erro) {
      console.error("Erro ao buscar CEP:", erro);
      toast.error("CEP não encontrado ou erro no servidor.");
    }
  } else {
    console.log("CEP inválido (não tem 8 dígitos)");
  }
};

//função cadastrar usuario
const cadastrarUsuario = async () => {
  carregando.value = true
  if (
    !logradouro.value ||
    !numero.value ||
    !bairro.value ||
    !cidade.value ||
    !cep.value
  ) {
    toast.warning("Preenchas todos os campos.");
    return;
  }

  const dados = {
    ...dadosPasso1.value,
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
  };

  try {
    const resposta = await api.post("/auth/registro", dados);

    console.log("Resposta do servidor: ", resposta.data);
    toast.success("Cadastrado com sucesso");
    router.push("/login");
  } catch (erro: any) {
    if (erro.response && erro.response.data && erro.response.data.erro) {
      toast.error(erro.response.data.erro);
    } else {
      toast.error("Erro de conexão com o servidor");
    }
  } finally {
    carregando.value = false
  }
};

//função para barra de progresso reativa
const progresso = computed(() => {
  const campos = [
    cep.value,
    logradouro.value,
    numero.value,
    bairro.value,
    cidade.value,
  ];

  const preenchidos = campos.filter((v) => v.trim() !== "").length;

  return (preenchidos / campos.length) * 100;
});

//função voltar
const voltar = () => {
  router.push("/cadastro-step1");
};
</script>
