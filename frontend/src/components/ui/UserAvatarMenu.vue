<script setup lang="ts">
//imports vue
import { ref, onMounted, onUnmounted } from "vue";

//imports Toastify
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//Lucide Icons
import {
  UserIcon,
  CameraIcon,
  SettingsIcon,
  LogOutIcon,
  Trash2Icon,
} from "@lucide/vue";

//componentes
import UserAvatar from "./UserAvatar.vue";

//props
const props = defineProps<{
  fotoPerfil: string | null; //caminho da foto no servidor
  nome: string; // Nome do usuário
  size: "small" | "medium" | "large"; //Tamanho do avatar
}>();

//emits
const emit = defineEmits<{
  "foto-selecionada": [file: File]; //dispara quando o usuário seleciona uma foto válida (envia o arquivo)
  "ver-perfil": []; //Dispara quando clica em "Ver perfil"
  configuracoes: []; //Dispara quando clica em "Configurações"
  sair: []; //Dispara quando clica em "Sair"
  "remover-foto": [];
}>();

//variáveis reativas
const menuAberto = ref(false); //controla se o menu está aberto ou não
const inputFotoRef = ref<HTMLInputElement | null>(null); //tipo HTMLInputElement | null faz referência ao input file escondido
const menuRef = ref<HTMLDivElement | null>(null); //Faz referência para o container do menu para detectar cliques fora do componente

//função alternar menu
const toggleMenu = () => {
  menuAberto.value = !menuAberto.value; //inverte o estado do menuAberto
};

//função fechar menu
const fecharMenu = () => {
  menuAberto.value = false; //fecha o menu
};

const abrirSeletorFoto = () => {
  //verifica se o ref do input existe
  if (inputFotoRef.value) {
    //abre o seletor de arquivos do sistema
    inputFotoRef.value.click();

    //fecha o menu dropdown
    fecharMenu();
  }
};

//função para alterar foto
const handleFotoChange = (event: Event) => {
  //faz o cast do evento para acessar os arquivos
  const target = event.target as HTMLInputElement; //acessando o input
  const file = target.files?.[0];

  //verifica se um arquivo foi selecionado
  if (!file) {
    return;
  }

  //validação de tipo
  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
  if (!tiposPermitidos.includes(file.type)) {
    toast.error("Apenas imagens são permitidas (JPG, PNG, GIF)");
    target.value = "";
    return;
  }

  //validação de tamanho (5MB)
  const tamanhoMaximo = 5 * 1024 * 1024;
  if (file.size > tamanhoMaximo) {
    toast.error("A imagem precisa ter no máximo 5MB");
    target.value = "";
    return;
  }

  //se passou nas validações emite o evento
  emit("foto-selecionada", file); //envia o arquivo como payload

  //limpa o input
  target.value = "";
};

//função para detectar cliques fora do componente e fechar o menu
const handleClickFora = (event: Event) => {
  //verificando se o menu está aberto
  if (!menuAberto.value) {
    return;
  }

  //verificando se o clique foi fora do componente
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    //'as Node' para dizer que é um elemento do DOM que recebeu o evento
    // 'contains()' verifica se um elemento está dentro de outro elemento
    fecharMenu();
  }
};

//executa quando o componente é montado
onMounted(() => {
  //adiciondo o listener de click fora no documento
  document.addEventListener("click", handleClickFora);
});

//Executa quando o componente é destruído
onUnmounted(() => {
  //removendo o listener de clique fora do documento
  document.removeEventListener("click", handleClickFora);
});
</script>

<template>
  <div ref="menuRef" class="user-menu-container">
    <!--Avatar clicável-->
    <div @click="toggleMenu" class="avatar-trigger">
      <UserAvatar
        :foto-perfil="fotoPerfil"
        :nome="nome"
        :size="size || 'large'"
      />
    </div>

    <!--menu Dropdown-->
    <div v-if="menuAberto" class="dropdown-menu">
      <!--Opções do menu-->
      <button @click="emit('ver-perfil')" class="menu-item">
        <UserIcon :size="20" :stroke-width="2" />
        <span>Ver Perfil</span>
      </button>

      <!--Opção de mudar foto-->
      <button @click="abrirSeletorFoto" class="menu-item">
        <CameraIcon :size="20" :stroke-width="2" />
        <span>{{ fotoPerfil ? 'Mudar Foto de Perfil' : 'Adicionar Foto de Perfil' }}</span>
      </button>

      <!--Opção de remover foto-->
      <button @click="emit('remover-foto')" v-if="fotoPerfil" class="menu-item">
        <Trash2Icon :size="20" :stroke-width="2" />
        <span>Remover Foto de Perfil</span>
      </button>

      <button @click="emit('configuracoes')" class="menu-item">
        <SettingsIcon :size="20" :stroke-width="2" />
        <span>Configurações</span>
      </button>

      <!--Opção de sair-->
      <button @click="emit('sair')" class="menu-item">
        <LogOutIcon :size="20" stroke-width="2" />
        <span>Sair</span>
      </button>
    </div>

    <!--Input file escondido-->
    <input
      type="file"
      ref="inputFotoRef"
      accept="image/jpeg,image/png,image/gif"
      @change="handleFotoChange"
      style="display: none"
    />
  </div>
</template>

<style>
.user-menu-container {
  position: relative;
  display: inline-block;
}

.avatar-trigger {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-trigger:hover {
  transform: scale(1.05);
}

.dropdown-menu {
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  top: calc(100% + 16px);
  right: 0;
  background-color: var(--color-background);
  width: 200px;
  height: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideDown 0.2s ease-out;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
  text-align: left;
  font-family: var(--primary-font);
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

/* Animação de entrada */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
