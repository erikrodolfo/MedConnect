<script setup>
import { ref, onMounted, computed, useTemplateRef } from "vue";
import axios, { HttpStatusCode } from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const agendamentos = ref([]);
const buscar = ref("");
const dadosSelect = ref([]);
const carregando = ref(false);
let timerBusca;

// Busca TODOS os agendamentos (O backend sabe que é Admin pelo token)
const carregarAgendamentos = async () => {
  try {
    const token = localStorage.getItem("token");
    const resposta = await axios.get("http://localhost:3000/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    agendamentos.value = resposta.data;
  } catch (erro) {
    console.error("Erro ao buscar agenda global:", erro);
  }
};

//filtrando por nomes
const agendamentosFiltrados = computed(() => {
  //se não houver um valor dentro do campo, ele retorna a lista com todos os agendamentos
  if (!buscar.value) return agendamentos.value;

  //transformando a string em minúscula
  const nomeBuscado = buscar.value.toLocaleLowerCase();

  return agendamentos.value.filter((agenda) => {
    const nomePaciente = agenda.pacienteId?.nome?.toLocaleLowerCase() || "";
    return nomePaciente.includes(nomeBuscado);
  });
});

//atualizando os status
const atualizarStatus = async (agendamentoId, novoStatus) => {
  const token = localStorage.getItem("token");
  dadosSelect.value.push(agendamentoId);
  try {
    //
      await axios.patch(
      `http://localhost:3000/agendamentos/${agendamentoId}/status`,
      { status: novoStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dadosSelect.value = dadosSelect.value.filter((id) => id !== agendamentoId);
  } catch (error) {
    console.error("Falha ao atualizar:", error);
    carregarAgendamentos();
  if(error.response?.status === 401) return router.push('/login')
    dadosSelect.value = dadosSelect.value.filter((id) => id !== agendamentoId);
  }
};

const buscarPacientes = () => {
  clearTimeout(timerBusca);
  carregando.value = true;

  timerBusca = setTimeout(async () => {
    const token = localStorage.getItem("token");
    console.log("Enviando requisição para:", buscar.value);
    const { data } = await axios.get(
      `http://localhost:3000/agendamentos?busca=${buscar.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    agendamentos.value = data;
    carregando.value = false;
  }, 700);
};

const fazerLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  router.push("/login");
};

onMounted(() => {
  carregarAgendamentos();
});
</script>

<template>
  <div class="admin-container">
    <header>
      <h1>Painel de Controle - Administração</h1>
      <button @click="fazerLogout">Sair</button>
    </header>

    <main>
      <h2>Todos os Agendamentos da Clínica</h2>
      <!--Input de busca-->
      <input
        @input="buscarPacientes"
        type="text"
        id="buscar"
        v-model="buscar"
        placeholder="Buscar paciente..."
      />
      <p>Total no sistema: {{ agendamentos.length }}</p>
      <p v-if="agendamentosFiltrados.length < agendamentos.length">
        Buscando: {{ agendamentosFiltrados.length }}
      </p>
      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Data e Hora</th>
            <th>Clima Previsto</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="agenda in agendamentosFiltrados"
            :key="agenda._id"
            :class="{
              'linha-cancelada': agenda.status === 'CANCELADA',
              'linha-concluida': agenda.status === 'CONCLUIDA',
            }"
          >
            <td>{{ agenda.pacienteId?.nome || "Paciente Desconhecido" }}</td>
            <td>{{ new Date(agenda.dataHora).toLocaleString() }}</td>
            <td>{{ agenda.previsao }}</td>
            <td>{{ agenda.status }}</td>
            <td>
              <span v-if="dadosSelect.includes(agenda._id)">Salvando...</span>
              <select
                v-model="agenda.status"
                @change="atualizarStatus(agenda._id, agenda.status)"
                :disabled="dadosSelect.includes(agenda._id)"
              >
                <option value="CANCELADA">CANCELAR</option>
                <option value="CONCLUIDA">CONCLUIR</option>
                <option value="AGENDADA">AGENDAR</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<style scoped>
/* Estilos básicos só para não ficar bagunçado no teste */
.admin-container {
  padding: 20px;
}
header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #006952;
}

.header-acoes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.input-busca {
  padding: 8px 12px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Reduz o peso visual das consultas canceladas (Deixa cinza/opaco) */
.linha-cancelada {
  opacity: 0.5;
  background-color: #ff0000;
}
.linha-cancelada td {
  text-decoration: line-through; /* Risca o texto */
}

/* Destaca levemente as concluídas (Verde suave) */
.linha-concluida {
  background-color: #004e07d2;
}

span {
  position: absolute;
  left: 450px;
  top: 440px;
}
</style>
