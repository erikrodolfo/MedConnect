<script setup lang="ts">
import BackgroundImg from "@/assets/background.png";
</script>

<template>
  <main class="auth-layout">
    <section class="auth-content">
      <slot></slot>
    </section>

    <section class="auth-hero">
      <img :src="BackgroundImg" class="hero-image" />
    </section>
  </main>
</template>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  width: 100vw;
  background-image: linear-gradient(
    160deg,
    var(--color-primary),
    var(--color-secondary),
    var(--color-primary-light) 50%,
    var(--color-background) 50%
  );
}

.auth-content {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-hero {
  display: none;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Garante que a imagem preencha o espaço sem distorcer*/
}

@media (min-width: 768px) and (max-width: 1299px) and (min-height: 600px) {
  .auth-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-image: none;
    background-color: var(--color-background);
  }

  .auth-hero {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 13px 13px 13px 0;
  }

  .auth-hero img {
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 24px;
  }
}

@media screen and (min-width: 1300px) {
  .auth-layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    background-image: none;
    background-color: var(--color-background);
  }

  .auth-hero {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 13px 13px 13px 0;
  }

  .auth-hero img {
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  }
}
</style>
