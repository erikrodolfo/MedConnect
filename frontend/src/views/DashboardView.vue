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
  Clock
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
const openDropdown = ref(false);
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

  const diaSemana = data
  .toLocaleString("pt-BR", { weekday: "short" })

  const dia = data
  .toLocaleString("pt-BR", { day: "2-digit" })

  const mes = data
  .toLocaleString("pt-BR", { month: "long" })

  const dataFormatada = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;

  return dataFormatada;;
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
    fecharDropdown();
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

//função para abrir/fechar dropdown
function toggleDropdown(agendamento) {
  agendamentoSelecionado.value = agendamento;
  openDropdown.value = true;
}

//função para fechar dropdown
function fecharDropdown() {
  openDropdown.value = false;
}

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

console.log("Agendamento selecionado:", agendamentoSelecionado.value);
</script>

<template>
  <div class="dashboard-page">
    <header class="user-header">
      <nav class="user-nav">
        <!--Container de logo-->
        <div class="logo-wraper">
          <a href="/dashboard"> MedConnect </a>
        </div>
        <!--container de avatar e nome -->
        <div v-if="usuarioLogado" class="avatar">
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
      <h2 class="dashboard-title" v-if="usuarioLogado">
        Olá, {{ usuarioLogado.nome }}!
      </h2>
      <p class="dashboard-subtitle">
        Aqui você pode agendar e acompanhar suas consultas médicas.
      </p>
      <form @submit.prevent="agendar" class="dashboard-form card">
        <!--Título do formulário-->
        <h1 class="form-title">Agendar Nova Consulta</h1>

        <!--Input de data-->
        <label for="data">Data da Consulta</label>
          <div class="field">
            <Calendar1 size="20" stroke-width="1.5" class="icon"/>
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
          <label for="horario">Horários Disponíveis</label>
          <div class="field">
            <Clock size="20" stroke-width="1.5" class="icon"/>
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
        <BaseButton :loading="carregando" type="submit" class="btn-agendar">Agendar Consulta</BaseButton>
      </form>

        <div class="agenda card" v-for="agendamento in listaAgendamentos" :key="agendamento._id">
          <div class="data-status-wrapper">
            <p class="data">{{ formatarData(agendamento.dataHora) }}</p>
            <p :class="classeStatus(agendamento.status)">{{ agendamento.status }}</p>
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
                @click="cancelarConsulta(agendamentoSelecionado._id)"
              >
                Cancelar
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
}

.dashboard-page {
  background-color: var(--color-background-alt);
  color: var(--color-text-primary);
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

header {
  z-index: 99999;
}

.user-nav {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-header {
  background-color: var(--color-background-alt);
  width: 100%;
  height: auto;
  padding: 1rem 1.5rem ;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  border-bottom: 1px solid var(--color-primary);
}

.user-header .logo-wraper a {
  font-size: 1.7rem;
  font-weight: 500;
  background: -webkit-linear-gradient(
    45deg,
    var(--color-primary),
    var(--color-secondary),
    var(--color-primary-light)
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  font-family: var(--secondary-font);
}

/* Main */
main {
  position: relative;
  flex: 1;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  background-color: transparent;
  border-radius: 15px;
  margin-top: 5rem;
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

.dashboard-form label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-align: left;
}

.dashboard-form input {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-primary-lighter);
  padding: 10px 20px;
  border-radius: 8px;
  text-align: left;
  box-sizing: border-box;
}

.dashboard-form input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 5px var(--color-primary-light);
}

.dashboard-form input::placeholder {
  color: var(--color-secondary);
}

.dashboard-form select {
  background-color: var(--color-background);
  border: 1px solid var(--color-primary-lighter);
  padding: 10px 20px;
  border-radius: 8px;
  color: var(--color-text-primary);
  text-align: left;
}

.dashboard-form select:disabled {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.dashboard-form select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 5px var(--color-primary-light);
}

.dashboard-form select option {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: none;
  text-align: center;
}

.field {
  position: relative;
}

.field input,
.field select {
  width: 100%;
  padding-left: 40px;
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Agenda */
.agenda {
  font-weight: 300;
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
    background-color: var(--color-background);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-cancelada {
    background-color: var(--color-background);
  color: var(--color-error);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
} 

.status-concluida {
    background-color: var(--color-background);
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


.btn-cancelar {
  background-color: var(--color-surface);
  color: var(--color-error);
  text-transform: uppercase;
  border: 1px solid var(--color-error);
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancelar:hover {
  background-color: var(--color-error);
  color: var(--color-background-alt);
}

.btn-cancelar:disabled {
  background-color: var(--color-text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

</style>
