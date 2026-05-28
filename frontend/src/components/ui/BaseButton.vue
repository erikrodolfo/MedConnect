<script setup lang="ts">
import { Loader2Icon } from "@lucide/vue";

defineProps<{
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}>();
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled || loading"
    class="base-button"
  >
    <span class="content">
      <slot></slot>
      <Loader2Icon
        v-if="loading"
        :size="20"
        :stroke-width="2"
        class="spinner"
      />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  font-family: var(--font-primary);
  width: 100%;
  margin: 0;
  box-sizing: border-box; /* Garante que o padding não estoure a largura */

  border-radius: 20px;
  background-image: linear-gradient(
    45deg,
    var(--color-primary),
    var(--color-secondary),
    var(--color-primary-light)
  );
  border: none;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 24px;
  color: var(--color-primary-lighter);
  font-size: 1rem;
  font-weight: 600;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    transform 0.1s ease,
    opacity 0.3s ease;
  cursor: pointer;
}

.base-button:active:not(:disabled) {
  transform: scale(0.95);
}

.base-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  padding: 12px;
}

.spinner {
  animation: spin 1s linear infinite;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media screen and (min-width: 768px) and (max-width: 1299px) and (min-height: 600px) {
  .base-button {
    padding: 13px;
    border-radius: 10px;
    transition: all 0.3s ease-out;
  }

  .base-button:hover {
    -webkit-box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
    -moz-box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
    box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
  }

  .base-button:disabled {
  padding: 13px;
}
}

@media screen and (min-width: 1300px) {
  .base-button {
    margin-top: 10px;
    border-radius: 10px;
    padding: 15px;
    transition: all 0.3s ease;
  }

  .base-button:disabled {
  padding: 15px;
}

  .base-button:hover {
    -webkit-box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
    -moz-box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
    box-shadow:
      0px 0px 15px var(--color-primary-light),
      0 0 30px var(--color-primary-lighter);
  }

  .spinner {
    width: 21px;
  height: 21px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
