<script setup lang="ts">
import { ref, computed } from "vue";
import { UserIcon, XIcon } from "@lucide/vue";

// Props
const props = defineProps<{
  modelValue: File | null; //pode ser um arquivo ou null (vazio)
}>();

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: File | null]; //enviando dados pro pai (ref)
}>();

// Refs
const fileInput = ref<HTMLInputElement | null>(null); //elemento input ou null - valor inicial será null
const previewUrl = ref<string>(""); //url temporária da imagem para mostrar a imagem antes de enviar ao servidor
const erro = ref<string>("");

// Computed
const temFoto = computed(() => !!previewUrl.value); //se tem foto = true, se não tem foto = false

// Função para abrir seletor de arquivos
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Função para validar arquivo
const validarArquivo = (file: File): boolean => { //arquivo a validar - retorna true ou false
  erro.value = "";

  // Validar tamanho (5MB)
  const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
  if (file.size > tamanhoMaximo) {
    erro.value = "Arquivo muito grande! Máximo: 5MB";
    return false;
  }

  // Validar tipo
  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"]; //lista com os MIME permitidos
  if (!tiposPermitidos.includes(file.type)) { //includes verifica se está na lista
    erro.value = "Tipo não permitido. Use JPG, PNG ou GIF";
    return false;
  }

  return true;
};

// Função quando usuário seleciona arquivo
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement; //pega o elemento input que disparou o elemento
  const file = target.files?.[0]; //pegando o primeiro arquivo selecionado

  if (!file) return; //se não tem arquivo, sai da função (usuário pode ter cancelado)

  // Validar arquivo
  if (!validarArquivo(file)) {
    // Limpar input
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    return;
  }

  // Criar preview
  previewUrl.value = URL.createObjectURL(file); //cria URL temporária / api do navegador

  // Emitir para o pai
  emit("update:modelValue", file);
};

// Função para remover foto
const removerFoto = () => {
  previewUrl.value = "";
  erro.value = "";

  // Limpar input
  if (fileInput.value) {
    fileInput.value.value = "";
  }

  // Emitir null para o pai
  emit("update:modelValue", null);
};
</script>

<template>
  <div class="image-upload-container">
    <!-- Input file escondido -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      hidden
    />

    <!-- Área clicável -->
    <div
      class="upload-area"
      :class="{ 'has-image': temFoto }"
      @click="triggerFileInput"
      role="button"
      aria-label="Selecionar foto de perfil"
      tabindex="0"
    >
      <!-- Preview da imagem -->
      <img
        v-if="temFoto"
        :src="previewUrl"
        alt="Preview da foto"
        class="preview-image"
      />

      <!-- Placeholder quando não tem foto -->
      <div v-else class="placeholder">
        <UserIcon :size="48" :stroke-width="1.5" />
        <span>Adicionar foto</span>
      </div>

      <!-- Botão remover (aparece só quando tem foto) -->
      <button
        v-if="temFoto"
        type="button"
        class="remove-button"
        @click.stop="removerFoto"
        aria-label="Remover foto"
      >
        <XIcon :size="16" />
      </button>
    </div>

    <!-- Mensagem de erro -->
    <p v-if="erro" class="error-message">{{ erro }}</p>

    <!-- Dica de tamanho -->
    <p class="hint">JPG, PNG ou GIF. Máximo 5MB</p>
  </div>
</template>

<style scoped>
.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

/* Área clicável */
.upload-area {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed var(--color-primary);
  background-color: var(--color-surface);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: var(--color-secondary);
  transform: scale(1.05);
}

.upload-area:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Quando tem imagem, remove borda tracejada */
.upload-area.has-image {
  border-style: solid;
}

/* Placeholder (sem foto) */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 20px;
}

.placeholder svg {
  color: var(--color-primary);
}

.placeholder span {
  font-size: 0.9rem;
}

/* Preview da imagem */
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Botão remover */
.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.remove-button:hover {
  background-color: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

/* Mensagem de erro */
.error-message {
  color: var(--color-error);
  font-size: 0.85rem;
  margin: 0;
}

/* Dica */
.hint {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-top: 10px;
}

/* Responsivo - Tablet e Desktop */
@media screen and (min-width: 768px) {
  .upload-area {
    width: 180px;
    height: 180px;
  }
}
</style>
