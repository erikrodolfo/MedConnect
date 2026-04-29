<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="auth-header">
     <slot name="logo"></slot>

    <h1>{{ title }}</h1>
    <p class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.auth-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 25px;
}

.auth-header :deep(img),
.auth-header :deep(svg) {
  width: 12rem;
  align-self: center;
  margin-bottom: 10px;
}

.auth-header h1 {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 2rem;
  text-align: left;
  margin-bottom: 10;
}

.auth-header p.subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  text-align: left;
  margin: 0;
}


@media screen and (min-width: 768px) and (min-height: 600px){
  .auth-header :deep(img),
  .auth-header :deep(svg) {
    width: 17rem;
  }

  .auth-header h1 {
    font-size: 2.2rem;
  }
}

</style>
