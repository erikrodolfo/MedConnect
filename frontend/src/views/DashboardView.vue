<!--===================SCRIPT===========================-->

<script setup>
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css'
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import api from "../services/api";

const usuarioLogado = ref(null);
const listaAgendamentos = ref([]);
const carregando = ref(false);
const dataSelecionada = ref("");
const horariosLivres = ref([]);
const horarioEscolhido = ref("");

const router = useRouter();

async function buscarDadosProtegidos() {
  try {
    const resposta = await api.get("/auth/perfil");
    usuarioLogado.value = resposta.data;
  } catch (erro) {
    console.error(erro);
  }
}

//buscar agendamentos
const buscarAgendamentos = async () => {
  carregando.value = true;
  try {
    const resposta = await api.get("/agendamentos");
    listaAgendamentos.value = resposta.data;
  } catch (erro) {
    console.error("Erro ao buscar a agenda", erro);
  } finally {
    carregando.value = false;
  }
};

//agendar consulta
const agendar = async () => {
  carregando.value = true;
  try {
    //lógica para não permitir agendamentos no passado
    const dataLocalCrua = `${dataSelecionada.value}T${horarioEscolhido.value}`;

    const dataObj = new Date(dataLocalCrua);
    const dataParaEnvio = dataObj.toISOString();

    const resposta = await api.post("/agendamentos", {
      dataHora: dataParaEnvio,
    });
    //adicona o novo no topo da lista na hora
    listaAgendamentos.value.unshift(resposta.data);

    dataSelecionada.value = "";
    horarioEscolhido.value = "";
    toast.success("Agendamento feito com sucesso!")
    buscarAgendamentos();
  } catch (erro) {
    toast.error(erro.response?.data?.erro || "Falha ao comunicar com o servidor.")
  } finally {
    carregando.value = false;
  }
};

//formatando a data
const formatarData = (dataISO) => {
  if (!dataISO) return "Data inválida";

  return new Date(dataISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

//função para cancelar consulta
const cancelarConsulta = async (id) => {
  const confirmacao = confirm("Tem certeza que deseja cancelar esta consulta?");
  if (!confirmacao) return;

  try {
    await api.delete(`/agendamentos/${id}`, {
      skipAuthRedirect: true
    });
    buscarAgendamentos();
  } catch (erro) {
   toast.error(erro.response?.data?.erro || "Falha ao comunicar com o servidor.");
  }
};

//função para buscar horários
const buscarHorarios = async () => {
  horarioEscolhido.value = "";
  try {
    const resposta = await api.get("/agendamentos/disponiveis", {
      params: { data: dataSelecionada.value },
    });

    horariosLivres.value = resposta.data;
  } catch (erro) {
    console.error("Erro ao buscar horários:", erro);
    horariosLivres.value = [];
  }
};

//função para o usuário não selecione uma data passado ao dia de hoje
const criarDataMinima = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const dataMinima = ref(criarDataMinima());

const criarDataMaxima = () => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() + 90); //limite de 90 dias a partir de hoje
  return hoje.toISOString().split("T")[0]; //
};

const dataMaxima = ref(criarDataMaxima());

onMounted(() => {
  buscarDadosProtegidos();
  buscarAgendamentos();
});

//fazer logout - leva para a tela de login
const fazerLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario")

  sessionStorage.removeItem("token")
  sessionStorage.removeItem("usuario")
  router.push("/login");

  toast.info("Você saiu da sua conta")
}
</script>

<template>
  <div class="dashboard-page">
    <h1>dashboard</h1>
    <div v-if="usuarioLogado">
      <h2>Bem vindo, {{ usuarioLogado.nome }}!</h2>
    </div>
    <form @submit.prevent="agendar">
      <input
        v-model="dataSelecionada"
        type="date"
        id="data"
        :min="dataMinima"
        :max="dataMaxima"
        @change="buscarHorarios"
      />
      <select v-model="horarioEscolhido" :disabled="horariosLivres.length === 0">
        <option v-for="horario in horariosLivres" :key="horario" :value="horario">
          {{ horario }}
        </option>
      </select>
      <button type="submit">Agendar</button>
    </form>
    <button @click="fazerLogout">Sair do sistema</button>
    <table>
      <caption>
        Agenda
      </caption>
      <thead>
        <tr>
          <th>Data/Hora</th>
          <th>Previsão do tempo</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="agendamento in listaAgendamentos" :key="agendamento._id">
          <td>{{ formatarData(agendamento.dataHora) }}</td>
          <td
            :class="{
              'texto-discreto': agendamento.previsao.includes('disponível'),
            }"
          >
            <p v-if="agendamento.previsao">{{ agendamento.previsao }}</p>
            <p v-else>Sem dados climáticos</p>
          </td>
          <td>{{ agendamento.status }}</td>
          <td>
            <button
              :disabled="carregando"
              @click="cancelarConsulta(agendamento._id)"
            >
              Cancelar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>