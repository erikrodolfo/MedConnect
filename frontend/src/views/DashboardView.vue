<script setup>
//biblioteca de notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//lucide icons
import {
  Loader2Icon,
  EllipsisVerticalIcon,
  EllipsisVertical,
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

  const dataFormatada = data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const horaFormatada = data.toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dataFormatada} - ${horaFormatada}h`;
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
        Bem-vindo(a), {{ usuarioLogado.nome }}!
      </h2>
      <p class="dashboard-subtitle">
        Aqui você pode agendar e acompanhar suas consultas médicas.
      </p>
      <form @submit.prevent="agendar" class="dashboard-form">
        <h1 class="form-title">Agendar Consulta</h1>
        <p class="form-subtitle">
          Selecione uma data e horário para agendar sua consulta.
        </p>
        <div class="inputs-wrapper">
          <input
            v-model="dataSelecionada"
            type="date"
            id="data"
            :min="dataMinima"
            :max="dataMaxima"
            @change="buscarHorarios"
          />
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
        <BaseButton :loading="carregando" type="submit">Agendar</BaseButton>
      </form>
      <table>
        <thead>
          <th>Data/Hora</th>
          <th>Status</th>
          <th>Ação</th>
        </thead>
        <tbody>
          <tr v-for="agendamento in listaAgendamentos" :key="agendamento._id">
            <td>
              {{ formatarData(agendamento.dataHora) }}
            </td>
            <td>{{ agendamento.status }}</td>
            <td>        <button
                class="btn-cancelar"
                :disabled="carregando"
                @click="cancelarConsulta(agendamentoSelecionado._id)"
              >
                Cancelar
              </button>
            <!--Button dropdown-->
            <button
                class="btn-dropdown"
                @click="toggleDropdown(agendamento)"
                title="Mais informações"
              >
                <EllipsisVerticalIcon size="20" stroke-width="2" />
              </button>
            </td>
            <td>
              
            </td>
          </tr>
        </tbody>
      </table>
      <!--Inf dropdown-->
      <Teleport to="body">
        <div
          v-if="openDropdown"
          class="dropdown-overlay"
          @click="fecharDropdown"
        >
          <div class="dropdown" @click.stop>
            <h2>Previsão do tempo</h2>
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
          </div>
        </div>
      </Teleport>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page {
  background-color: var(--color-background-alt);
  color: var(--color-text-primary);
  width: 100vw;
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

.user-header {
  background: var(--color-background-alt);
  width: 100%;
  height: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
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
  text-align: left;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

/* Formulário */
.dashboard-form {
  position: relative;
  width: 100%;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 20px;
  margin-top: 1.5rem;
}

.dashboard-form .form-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  background: -webkit-linear-gradient(
    -160deg,
    var(--color-primary),
    var(--color-secondary),
    var(--color-primary-light)
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
}

.dashboard-form .form-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.dashboard-form .inputs-wrapper {
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dashboard-form input {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-primary);
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.dashboard-form input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 5px var(--color-primary-light);
}

.dashboard-form input::placeholder {
  color: var(--color-secondary);
}

.dashboard-form select {
  background-color: var(--color-background);
  border: 1px solid var(--color-primary);
  padding: 10px 20px;
  border-radius: 10px;
  color: var(--color-text-primary);
  font-weight: 600;
  text-align: center;
}

.dashboard-form select:disabled {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.dashboard-form select:focus {
  outline: none;
  box-shadow: 0 0 5px var(--color-primary-light);
}

.dashboard-form select option {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: none;
  text-align: center;
}

/* Tabela */
table {
  background-color: var(--color-background);
  border-radius: 20px;
  width: 100%;
  height: auto;
  border-spacing: 0;
  overflow: hidden;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

table thead {
  width: 100%;
  background-image: linear-gradient(
    160deg,
    var(--color-primary),
    var(--color-secondary),
    var(--color-primary-light)
  );
  color: var(--color-background);
}

table thead th {
  padding: 10px;
  border-right: 1px solid var(--color-border);
  text-align: center;
}

table tbody tr {
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

table tbody tr:last-child {
  border-bottom: none;
  border-right: none;
}

table tbody td {
  border-right: 1px solid var(--color-border);
  padding: 5px;
}


.btn-cancelar {
  background-color: var(--color-background);
  color: var(--color-primary);
  text-transform: uppercase;
  border: 1px solid var(--color-primary);
  padding: 5px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancelar:hover {
  background-color: var(--color-primary-light);
  color: var(--color-background);
}

.btn-cancelar:disabled {
  background-color: var(--color-text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-dropdown {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-dropdown:hover {
  background-color: var(--color-surface);
  color: var(--color-primary-light);
}

</style>

<!-- Estilos globais para o Teleport dropdown -->
<style>
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dropdown {
  position: relative;
  background-color: var(--color-background-alt);
  width: 18.5rem;
  max-width: 400px;
  padding: 1.5rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 32px;
  border-radius: 10px;
  z-index: 1001;
  color: var(--color-text-primary);
}

.dropdown::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-image: linear-gradient(
    45deg,
    var(--color-primary),
    var(--color-secondary)
  );
  border-radius: 0 0 10px 10px;
}

.dropdown h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  background: -webkit-linear-gradient(
    45deg,
    var(--color-secondary),
    var(--color-primary-light)
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
