<template>
  <div class="under-development-page">
    <div class="under-development-card">
      <Construction :size="80" :stroke-width="1.5" class="icon" />
      <h1>Página em Desenvolvimento</h1>
      <p>Esta funcionalidade ainda está sendo construída.</p>
      <p class="subtitle">Em breve estará disponível!</p>
      <button @click="voltar" class="back-button">
        <ArrowLeft :size="20" />
        Voltar
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Construction, ArrowLeft } from "@lucide/vue";

const router = useRouter();

const voltar = () => {
  router.push("/login"); // Volta para a página anterior
};
</script>

<style scoped>
.under-development-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-secondary) 100%
  );
}

.under-development-card {
  background-color: var(--color-background);
  border-radius: 15px;
  padding: 30px 0;
  text-align: center;
  max-width: 21rem;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 24px;
  padding: 20px;
}

.icon {
  color: var(--color-warning);
  margin-bottom: 20px;
}

h1 {
  color: var(--color-text-primary);
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 15px;
}

p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.subtitle {
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 30px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--color-primary);
  color: var(--color-primary-light);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.back-button:hover {
  background-color: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
}
</style>
