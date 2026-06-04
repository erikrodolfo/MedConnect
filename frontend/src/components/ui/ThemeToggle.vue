<script setup lang="ts">
import { useTheme } from "../../composables/useTheme";
import { MoonStar, SunDim } from "@lucide/vue";

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <button
    @click="toggleTheme"
    :aria-pressed="theme === 'dark' ? 'true' : 'false'"
  >
    <MoonStar v-if="theme === 'dark'" stroke-width="1"/>
    <SunDim v-else />
  </button>
</template>

<style scoped>
button {
  background-color: var(--color-primary-lighter);
  width: 35px;
  height: 35px;
  border-radius: 10px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

button svg {
  transition: all 0.3s ease;
  color: var(--color-primary-dark);
}

/* DARK */
button[aria-pressed="true"] {
  background-color: var(--color-gradient-middle);
}

/* DARK ICON */
button[aria-pressed="true"] svg {
  color: var(--color-text-primary);
}

button:hover svg {
  transform: rotate(20deg);
}
</style>
