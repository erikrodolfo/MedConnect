<!--Início Script-->

<script setup lang="ts">
//biblioteca de notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//imports vue
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

//Layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthCard from "../layouts/AuthCard.vue";
import AuthProgress from "../layouts/AuthProgress.vue";
import AuthHeader from "../layouts/AuthHeader.vue";
import BaseButton from "../components/ui/BaseButton.vue";

//components
import InputField from "../components/ui/InputField.vue";

//Lucide icons
import {
  Mailbox,
  MapPin,
  Hash,
  MapPinned,
  Building2,
  Loader2Icon,
} from "@lucide/vue";

//API backend
import api from "../services/api";

//Imagens
import MedConnectLogo from '@/assets/medconnect-logo-name.png'

//variáveis reativas
const cep = ref("");
const logradouro = ref("");
const numero = ref("");
const bairro = ref("");
const cidade = ref("");
const carregando = ref(false);
const dadosPasso1 = ref({
  nome: "",
  email: "",
  senha: "",
});

//roetador
const router = useRouter(); //isso precisa vir antes de tudo

//pegando os dados da tela anterior
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
  carregando.value = true;
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
    carregando.value = false;
  }
};

//função para barra de progresso reativa
const progresso2 = computed(() => {
  const campos = [
    cep.value,
    logradouro.value,
    numero.value,
    bairro.value,
    cidade.value,
  ];

  const preenchidos = campos.filter((v) => v.trim() !== "").length;

  const resultado = (preenchidos / campos.length) * 100;

  console.log("progresso:", resultado)

  return resultado
});

//função voltar
const voltar = () => {
  router.push("/cadastro-step1");
};
</script>

<template>
  <AuthLayout>
    <AuthCard>
      <AuthProgress :step="2" :progress="progresso2" />
      <AuthHeader
        title="Endereço"
        subtitle="Crie sua conta para começar a agendar suas consultas">
      
        <template #logo>
          <img :src="MedConnectLogo" alt="MedConnect Logo">
        </template>
      </AuthHeader>
      <!-- Formulário -->
      <form class="auth-form" @submit.prevent="cadastrarUsuario">
        <div class="form-container">
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
            :left-icon="MapPin"
            placeholder="Logradouro"
          />
          <!--Input número-->
          <InputField
            v-model="numero"
            type="text"
            id="numero"
            name="numero"
            :left-icon="Hash"
            placeholder="Número"
          />
          <!--Input bairro-->
          <InputField
            v-model="bairro"
            type="text"
            id="bairro"
            name="bairro"
            :left-icon="MapPinned"
            placeholder="Bairro"
          />
          <!--Input cidade-->
          <InputField
            v-model="cidade"
            type="text"
            id="cidade"
            name="cidade"
            :left-icon="Building2"
            :readonly="true"
            placeholder="Cidade"
          />
          <!-- Botão Cadastrar -->
          <BaseButton type="submit" :loading="carregando">
            <Loader2Icon
              v-if="carregando"
              :size="14"
              stroke-width="2"
              class="spinner"
            />
            {{ carregando ? "Cadastrando" : "Cadastrar" }}
          </BaseButton>
          <BaseButton type="button" @click="voltar" class="button-voltar"
            >Voltar</BaseButton
          >
        </div>
      </form>
    </AuthCard>
  </AuthLayout>
</template>

<!--Início Styles-->
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

.button-voltar {
  background-image: linear-gradient(45deg, var(--color-background), var(--color-background-alt));
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
