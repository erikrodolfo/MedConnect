<script setup lang="ts">
defineProps<{
  step: number;
  progress?: number;
}>();
</script>

<template>
  <div class="barra-wrapper">
    <div class="barra1" 
    :class="{ active: step >= 2 }"
    :style="step === 1 ? { '--progress': `${progress || 0}%` } : {}"
    ></div>
    <div
      class="barra2"
      :class="{ active: step >= 2 }"
      :style="step === 2 ? { '--progress': `${progress || 0}%` } : {}"
    ></div>
  </div>
</template>

<style scoped>
.barra-wrapper {
  width: 100%;
  display: flex;
  gap: 7px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.barra-wrapper > div {
  flex: 1;
  height: 7px;
  background-color: var(--color-primary-lighter);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.barra-wrapper .barra1.active {
  background-color: var(--color-primary);
}

/* Barra 1 - Preenchimento via variável CSS */
.barra-wrapper .barra1::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress, 0%);
  background-color: var(--color-primary);
  transition: width 0.3s ease-out;
  border-radius: 10px;
}

/* Barra 2 - Preenchimento total quando ativa */
.barra-wrapper .barra2::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--progress, 0%);
  background-color: var(--color-primary);
  transition: width 0.3s ease-out;
  border-radius: 10px;
}
</style>
