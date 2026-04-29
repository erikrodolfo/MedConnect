<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean; //recebe o valor do checkbox / vem do v-model
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void; //cria um evento que avisa ao pai que algo mudou
}>();

const toggle = (): void => {
  emit("update:modelValue", !props.modelValue); //inverte o valor e envia o valor pro pai (v-model)
};
</script>

<template>
  <label class="checkbox-wrapper">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="toggle"
      class="checkbox-input"
    />

    <span class="checkbox-custom"></span>

    <span class="checkbox-label">
      <slot></slot>
    </span>
  </label>
</template>

<style scoped>
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

/* esconde o checkbox padrão */
.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* caixa customizada */
.checkbox-custom {
  width: 13px;
  height: 13px;
  border: 2px solid var(--color-primary);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

/* quando marcado */
.checkbox-input:checked + .checkbox-custom {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

/* check */
.checkbox-input:checked + .checkbox-custom::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 4px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* texto */
.checkbox-label {
  color: var(--color-primary);
  font-size: 1rem;
}

@media screen and (min-width: 768px) {
  .checkbox-label:hover {
    color: var(--color-secondary);
  }
}
</style>
