<script setup>
//biblioteca de notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//lucide icons
import {
  Loader2Icon,
  EllipsisVerticalIcon,
  EllipsisVertical,
  Calendar,
  ChevronDown,
  Calendar1,
  Clock,
  CircleCheck,
  CircleX,
  X,
} from "@lucide/vue";

//roteador
import { useRouter } from "vue-router";

//imports vue
import { onMounted, ref } from "vue";

//api backend
import api from "../services/api";

//components
import UserAvatarMenu from "../components/ui/UserAvatarMenu.vue";
import ThemeToggle from "../components/ui/ThemeToggle.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import InputField from "../components/ui/InputField.vue";

//layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthHeader from "../layouts/AuthHeader.vue";

//pinia
import { useUserStore } from "../stores/UserStore";

const userStore = useUserStore();

const usuarioLogado = ref(null);
const listaAgendamentos = ref([]);
const carregando = ref(false);
const dataSelecionada = ref("");
const horariosLivres = ref([]);
const horarioEscolhido = ref("");
const agendamentoSelecionado = ref(null);

const router = useRouter();

async function buscarDadosProtegidos() {
  try {
    const resposta = await api.get("/auth/perfil", {
      skipAuthRedirect: true,
    });

    usuarioLogado.value = resposta.data;

    await userStore.buscarPerfil();
  } catch (erro) {
    console.error(erro);
  }
}

//buscar agendamentos
const buscarAgendamentos = async () => {
  carregando.value = true;
  try {
    const resposta = await api.get("/agendamentos", {
      skipAuthRedirect: true,
    });

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
    toast.success("Agendamento feito com sucesso!");
    buscarAgendamentos();
  } catch (erro) {
    toast.error(
      erro.response?.data?.erro || "Falha ao comunicar com o servidor.",
    );
  } finally {
    carregando.value = false;
  }
};

//formatando a data

//formatando a data
const formatarData = (dataISO) => {
  if (!dataISO) return "Data inválida";

  const data = new Date(dataISO);

  const diaSemana = data.toLocaleString("pt-BR", { weekday: "short" });

  const dia = data.toLocaleString("pt-BR", { day: "2-digit" });

  const mes = data.toLocaleString("pt-BR", { month: "long" });

  const dataFormatada = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;

  return dataFormatada;
};

//formatando hora
const formatarHora = (dataISO) => {
  if (!dataISO) return "Hora inválida";

  const data = new Date(dataISO);

  const horaFormatada = data.toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return horaFormatada;
};

//função para cancelar consulta
const cancelarConsulta = async (id) => {
  const confirmacao = confirm("Tem certeza que deseja cancelar esta consulta?");
  if (!confirmacao) return;

  try {
    await api.delete(`/agendamentos/${id}`, {
      skipAuthRedirect: true,
    });
    buscarAgendamentos();
  } catch (erro) {
    toast.error(
      erro.response?.data?.erro || "Falha ao comunicar com o servidor.",
    );
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
  localStorage.removeItem("usuario");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
  router.push("/login");

  toast.info("Você saiu da sua conta");
};

//função para lidar com upload de foto
const handleFotoSelecionada = async (file) => {
  try {
    // Criar FormData
    const formData = new FormData();
    formData.append("fotoPerfil", file);

    // Enviar para o backend
    const resposta = await api.patch("/auth/perfil/foto", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Atualizar o userStore com a nova foto
    await userStore.buscarPerfil();

    toast.success("Foto atualizada com sucesso!");
  } catch (erro) {
    console.error("Erro ao atualizar foto:", erro);
    toast.error(
      erro.response?.data?.erro || "Erro ao atualizar foto de perfil",
    );
  }
};

//função para remover foto de perfil
const handleRemoverFoto = async () => {
  // Confirmação
  const confirmar = confirm(
    "Tem certeza que deseja remover sua foto de perfil?",
  );

  if (!confirmar) {
    return;
  }

  try {
    // Enviar requisição para remover foto
    await api.delete("/auth/perfil/foto");

    // Atualizar o userStore
    await userStore.buscarPerfil();

    toast.success("Foto removida com sucesso!");
  } catch (erro) {
    console.error("Erro ao remover foto:", erro);
    toast.error(erro.response?.data?.erro || "Erro ao remover foto de perfil");
  }
};

//função para ir para o perfil
const irParaPerfil = () => {
  router.push("/perfil");
};

//função para ir para configurações
const irParaConfiguracoes = () => {
  router.push("/configuracoes");
};

//função de classe para status
function classeStatus(status) {
  switch (status) {
    case "AGENDADA":
      return "status-agendada";
    case "CANCELADA":
      return "status-cancelada";
    case "CONCLUIDA":
      return "status-concluida";
    default:
      return "status-default";
  }
}
</script>

<template>
  <div class="dashboard-page">
    <header class="user-header">
      <nav class="user-nav">
        <!--Container de logo-->
        <div class="logo-wraper">
          <img src="../assets/medconnect-logo.png" alt="MedConnect" width="40"/>
        </div>
        <!--container de toggle theme e avatar -->
        <div v-if="usuarioLogado" class="theme-avatar">
          <ThemeToggle />
          <UserAvatarMenu
            :foto-perfil="userStore.usuario?.fotoPerfil ?? null"
            :nome="userStore.usuario?.nome || usuarioLogado.nome"
            size="small"
            @foto-selecionada="handleFotoSelecionada"
            @ver-perfil="irParaPerfil"
            @configuracoes="irParaConfiguracoes"
            @sair="fazerLogout"
            @remover-foto="handleRemoverFoto"
          />
        </div>
      </nav>
    </header>
    <main>
      <h1 class="dashboard-title" v-if="usuarioLogado">
        Olá, {{ usuarioLogado.nome }}!
      </h1>
      <p class="dashboard-subtitle">
        Aqui você pode agendar e acompanhar suas consultas médicas.
      </p>
      <form @submit.prevent="agendar" class="dashboard-form card">
        <!--Título do formulário-->
        <h1 class="form-title">Agendar Nova Consulta</h1>

        <!--Input de data-->
        <label>Data da Consulta</label>
        <div class="field">
          <Calendar1 size="20" stroke-width="1.5" class="icon" />
          <input
            v-model="dataSelecionada"
            type="date"
            id="data"
            :min="dataMinima"
            :max="dataMaxima"
            @change="buscarHorarios"
          />
        </div>

        <!--Seleção de horário-->
        <label>Horários Disponíveis</label>
        <div class="field">
          <Clock size="20" stroke-width="1.5" class="icon" />
          <select
            v-model="horarioEscolhido"
            :disabled="horariosLivres.length === 0"
          >
            <option value="" disabled selected hidden>Horários</option>
            <option
              v-for="horario in horariosLivres"
              :key="horario"
              :value="horario"
            >
              {{ horario }}
            </option>
          </select>
        </div>
        <BaseButton :loading="carregando" type="submit" class="btn-agendar"
          >{{ carregando ? 'Agendando...' : 'Agendar Consulta' }}</BaseButton
        >
      </form>

      <h2 v-if="listaAgendamentos.length > 0">Minhas Consultas</h2>

      <!-- Resumo dos agendamentos -->
      <section class="resumo">

        <!--Total de agendamentos-->
        <div class="total resumo-card">
          <div class="text-wrapper">
            <p>Total</p>
            <p style="color: var(--color-info)">{{ listaAgendamentos.length }}</p>
          </div>
          <div class="resumo-icon" style="color: var(--color-info);">
            <Calendar size="24" stroke-width="2" />
          </div>
        </div>

        <!--Total concluídas-->
        <div class="concluidas resumo-card">
          <div class="text-wrapper">
            <p>Concluídas</p>
            <p style="color: var(--color-success);">{{ listaAgendamentos.filter(a => a.status === 'CONCLUIDA').length }}</p>
          </div>
          <div class="resumo-icon" style="color: var(--color-success);">
             <CircleCheck size="24" stroke-width="2" />
          </div>
        </div>

        <!-- Total agendadas -->
         <div class="confirmados resumo-card">
          <div class="text-wrapper">
            <p>Agendada</p>
            <p style="color: var(--color-warning);">{{ listaAgendamentos.filter(a => a.status === 'AGENDADA').length }}</p>
          </div>
          <div class="resumo-icon" style="color: var(--color-warning);">
           <Clock size="24" stroke-width="2" />
          </div>
         </div>

         <!--Total canceladas-->
         <div class="canceladas resumo-card">
          <div class="text-wrapper">
            <p>Canceladas</p>
            <p style="color: var(--color-error);">{{ listaAgendamentos.filter( a => a.status === 'CANCELADA').length }}</p>
          </div>
          <div class="resumo-icon" style="color: var(--color-error);">
            <CircleX size="24" stroke-width="2" />
          </div>
        </div>
      </section>

      <!-- Lista de agendamentos -->
      <div
        class="agenda card"
        v-for="agendamento in listaAgendamentos"
        :key="agendamento._id"
      >
        <div class="data-status-wrapper">
          <p class="data">{{ formatarData(agendamento.dataHora) }}</p>
          <p :class="classeStatus(agendamento.status)">
            {{ agendamento.status }}
          </p>
        </div>
        <p class="hora">{{ formatarHora(agendamento.dataHora) }}</p>
        <div
          :class="{
            'texto-discreto':
              agendamentoSelecionado?.previsao?.includes('disponível'),
          }"
        >
          <p v-if="agendamentoSelecionado?.previsao">
            {{ agendamentoSelecionado.previsao }}
          </p>
          <p v-else>Sem dados climáticos</p>
        </div>
        <button
          class="btn-cancelar"
          :disabled="carregando"
          @click="cancelarConsulta(agendamento._id)"
        >
        <X :size="20" stroke-width="2"></X>
          {{ carregando ? 'Cancelando...' : 'Cancelar Consulta' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>

.card {
  width: 100%;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-light);
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--color-border);
}

.dashboard-page {
   background-image: linear-gradient(
    135deg,
    var(--color-gradient-start),
    var(--color-gradient-middle),
    var(--color-gradient-end)
  );

  color: var(--color-text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.user-nav {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[data-theme="dark"] .user-header {
  background-color: var(--color-gradient-start);
}

.user-header {
  background-color: var(--color-gradient-end);
  backdrop-filter: blur(10px);
  width: 100%;
  height: auto;
  padding: 10px 1rem;
  display: flex;
  top: 0;
  position: sticky;
  z-index: 1000;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-light);
}

.theme-avatar {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Main */
main {
  position: relative;
  flex: 1;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  background-color: transparent;
  border-radius: 15px;
}

main .dashboard-form {
  width: 100%;
}

main .dashboard-title {
  font-weight: 600;
  text-align: left;
  font-size: 1.7rem;
  color: var(--color-text-primary);
}

main .dashboard-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  text-align: left;
  margin: 0 0 1rem 0;
}

.dashboard-form .form-title {
  color: var(--color-text-primary);
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: left;
}

label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-align: left;
}

 input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-primary-lighter);
  display: block;
  margin: 0;
  padding: 12px 20px;
  padding-left: 40px;
  border-radius: 10px;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  min-height: 40px;
}

input[type="date"]::-webkit-date-and-time-value {
  text-align: left;
}

input[type="date"]::-webkit-calendar-picker-indicator {
 display: none;
}

input:focus {
  outline: none;
  border-color: var(--color-primary-light);
}

input::placeholder {
  color: var(--color-secondary);
}

select {
  background-color: var(--color-background);
  border: 1px solid var(--color-primary-lighter);
  padding: 12px 20px;
  border-radius: 8px;
  color: var(--color-text-primary);
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  padding-left: 40px;
}

select:disabled {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  cursor: not-allowed;
   text-align: left;
}

select:focus {
   text-align: left;
  outline: none;
  border-color: var(--color-primary-light);
}

select option:disabled {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

select option {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: none;
}

.field {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

main > h2 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin: 1rem 0 0.5rem 0;
  text-align: center;
  text-transform: uppercase;
}

/* Resumo dos agendamentos */
.resumo {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: 1fr 1fr;
}

.resumo-card {
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 12px;
  border-radius: 10px;
    box-shadow: var(--shadow-light);
    border: 1px solid var(--color-border)
}

.text-wrapper {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.resumo-card .text-wrapper p:first-child {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.resumo-card .text-wrapper p:last-child {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Agenda */
.agenda {
  font-weight: 300;
  text-align: left;
}

.data-status-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-default {
  border: 1px solid;
  background-color: var(--color-background);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-agendada {
  color: var(--color-info);
  border: 1px solid var(--color-info);
  background-color: var(--color-info-light);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-cancelada {
  background-color: var(--color-error-light);
  color: var(--color-error);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-concluida {
  background-color: var(--color-success-light);
  color: var(--color-success);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* Botões */

.btn-agendar {
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-agendar:disabled {
  padding: 10px;
  border-radius: 8px;
}

.btn-cancelar {
  background-color: rgb(var(--color-error-rgb), 0.2);
  color: var(--color-error);
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: rgb(var(--color-error-rgb), 0.3);
}

.btn-cancelar:active {
  transform: scale(0.99);
}

.btn-cancelar:disabled {
  background-color: var(--color-text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

[data-theme="dark"] .btn-cancelar {
  color: var(--color-error-light);
}
</style>
