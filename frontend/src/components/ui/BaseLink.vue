<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  to: string,
  variant?: 'primary' | 'muted'
}>()
</script>

<template>
  <RouterLink :to="to" :class="['base-link', variant || 'primary']">
    <slot></slot>
  </RouterLink>
</template>

<style>
.base-link {
  color: var(--color-primary);
  text-decoration: underline;
  font-weight: 600;
}

@media screen and (min-width: 768px) {
  .base-link {
    text-decoration: none;
  }

  .base-link:hover {
    text-decoration: underline;
    color: var(--color-secondary);
  }
}
</style>