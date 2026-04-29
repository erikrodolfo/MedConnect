<template>
  <div class="auth-card">
    <slot></slot>
  </div>
</template>

<style>
.auth-card {
  background-color: var(--color-background);
  border-radius: 20px;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 21rem;
  width: 100%;
  height: auto;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 24px;
  padding: 25px;
  box-sizing: border-box;
}

.auth-card p.no-account-text {
  color: var(--color-text-secondary);
}

@media screen and (min-width: 768px){
  .auth-card {
    background-color: transparent;
    box-shadow: none;
    max-width: 26rem;
    padding: 40px 30px;
  }
}
</style>
