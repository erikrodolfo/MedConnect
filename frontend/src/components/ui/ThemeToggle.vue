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
    <MoonStar v-if="theme === 'dark'" />
    <SunDim v-else />
  </button>
</template>

<style scoped>
button {
  background-color: var(--color-primary-lighter);
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    rgba(0, 0, 0, 0.07) 0px 1px 2px,
    rgba(0, 0, 0, 0.07) 0px 2px 4px,
    rgba(0, 0, 0, 0.07) 0px 4px 8px,
    rgba(0, 0, 0, 0.07) 0px 8px 16px,
    rgba(0, 0, 0, 0.07) 0px 16px 32px,
    rgba(0, 0, 0, 0.07) 0px 32px 64px;
}

button svg {
  transition: all 0.3s ease;
  color: var(--color-primary-dark);
}

/* DARK */
button[aria-pressed="true"] {
  background-color: var(--color-primary-dark);
  border: 1px solid var(--color-primary-lighter);
 -webkit-box-shadow:0px 0px 20px 8px rgba(140,199,235,1);
-moz-box-shadow: 0px 0px 20px 8px rgba(140,199,235,1);
box-shadow: 0px 0px 20px 8px rgba(140,199,235,1);
}

/* DARK ICON */
button[aria-pressed="true"] svg {
  color: var(--color-text-primary);
}

button:hover svg {
  transform: rotate(20deg);
}
</style>
