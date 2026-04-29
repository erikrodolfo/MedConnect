<script setup lang="ts">
//imports vue
import { ref, watch, computed } from "vue";

//lucide icons
import {
  CircleCheck,
  CircleX,
  CircleAlertIcon,
  CircleCheckBig,
} from "@lucide/vue";

const props = defineProps<{
  modelValue: string; //v-model da senha
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string]; //atualiza o v-model
  valid: [isValid: boolean]; //emite se a senha é válida
}>();

//validações reativas
const temMaiuscula = ref(false);
const temNumeros = ref(false);
const temEspeciais = ref(false);
const tamanhoMinSenha = ref(false);

//computed para verificar se todos os requisitos foram cumpridos
const senhaValida = computed(() => {
  return (
    temMaiuscula.value &&
    temNumeros.value &&
    temEspeciais.value &&
    tamanhoMinSenha.value
  );
});

//watch para validar a senha quando mudar
watch(
  () => props.modelValue,
  (novaSenha) => {
    temMaiuscula.value = /[A-Z]/.test(novaSenha);
    temNumeros.value = /[0-9]/.test(novaSenha);
    temEspeciais.value = /[!@#$%^&*]/.test(novaSenha);
    tamanhoMinSenha.value = novaSenha.length >= 6;

    //emite se a senha é valida
    emit("valid", senhaValida.value);
  },
  { immediate: true },
);
</script>

<template>
  <!--calcular força da senha-->
  <Transition name="slide-fade">
    <div v-if="modelValue" class="requisitos-senha">
      <p :class="{ 'senha-ok': senhaValida }">
        <component
          :is="senhaValida ? CircleCheckBig : CircleAlertIcon"
          :size="14"
          :stroke-width="2"
        />
        {{
          !senhaValida
            ? "Sua senha deve atender a todos os requisitos."
            : "Sua senha atende a todos os requisitos."
        }}
      </p>
      <ul>
        <!--Tem maiúscula-->
        <li :class="{ valido: temMaiuscula }">
          <component :is="temMaiuscula ? CircleCheck : CircleX" :size="14" />
          1 letra maiúscula
        </li>

        <!--Tem número-->
        <li :class="{ valido: temNumeros }">
          <component :is="temNumeros ? CircleCheck : CircleX" :size="14" />
          1 número
        </li>

        <!--Tem caractere especial-->
        <li :class="{ valido: temEspeciais }">
          <component :is="temEspeciais ? CircleCheck : CircleX" :size="14" />
          1 caractere especial
        </li>

        <!--Mínimo 8 caracteres-->
        <li :class="{ valido: tamanhoMinSenha }">
          <component :is="tamanhoMinSenha ? CircleCheck : CircleX" :size="14" />
          Mínimo 6 caracteres
        </li>
      </ul>
    </div>
  </Transition>
</template>

<style scoped>
.requisitos-senha {
  width: 100%;
  margin: 0;
  font-size: 0.9rem;
  transition: all 0.5s ease-in-out;
}

.requisitos-senha p {
  font-size: 0.7rem;
  width: 100%;
  text-align: start;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  color: var(--color-warning);
}

.requisitos-senha p svg {
  position: relative;
  transform: translateY(-1px);
  padding-right: 4px;
}

.requisitos-senha li {
  width: 100%;
  text-align: start;
  display: inline-flex;
  gap: 5px;
  padding: 3px 0;
  align-items: center;
}

.requisitos-senha li svg {
  color: var(--color-error);
  transition: all 1s ease;
  transform: translateY(-1.5px);
}

.requisitos-senha li.valido svg {
  color: var(--color-success);
}

p.senha-ok {
  transition: all 1s ease;
}

p.senha-ok,
.senha-ok svg {
  color: var(--color-success);
}

/* Transição da div de requisitos */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 200px; /* altura aproximada da div de requisitos */
}
</style>
