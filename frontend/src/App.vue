<template>
<RouterView v-slot="{ Component }">
  <Transition name="slide-fade" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>
</template>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
