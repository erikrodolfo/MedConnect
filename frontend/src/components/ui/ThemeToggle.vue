<script setup lang="ts">
import { useTheme } from '../../composables/useTheme';
import { MoonStar, SunDim } from '@lucide/vue';

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button @click="toggleTheme">
    <SunDim v-if="theme === 'dark'"/>
    <MoonStar v-else/>
  </button>
</template>

<style scoped>
button svg {
  transition: transform 0.3s ease;
}

button:hover svg {
  transform: rotate(20deg);
}
</style>