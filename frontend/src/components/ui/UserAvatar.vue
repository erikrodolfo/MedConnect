<script setup lang="ts">
import { computed } from 'vue';
import api from '../../services/api';
import { UserIcon } from '@lucide/vue';

  const props = defineProps<{
    fotoPerfil: string | null
    nome: string
    size?: 'small' | 'medium' | 'large'
  }>()

  const fotoUrl = computed(() => {
    if(props.fotoPerfil) {
      return `${api.defaults.baseURL}/${props.fotoPerfil}`
    } 
    return null
  })

  const iniciais = computed(() => {
    const iniciaisNome = props.nome.split(' ') //dividindo os nomes com o split e colocando em array
    if(iniciaisNome.length >= 2) { //contando as palavras
      const primeiraLetra = iniciaisNome[0][0] //acessando o primeiro elemento do array
      const segundaLetra = iniciaisNome[iniciaisNome.length - 1][0] //acessando o último elemento do array e pega a primeira eltra com o [0]

      return (primeiraLetra + segundaLetra).toUpperCase()
    } else {
      return props.nome.substring(0, 2).toUpperCase() //extraindo parte de uma string do indice 0 até 2
    }
  })

    const tamanhos = {
      small: '40px',
      medium: '48px',
      large: '64px'
    }

    const tamanho = computed(() => tamanhos[props.size || 'medium'])

</script>

<template>
  <div class="user-avatar" :style="{ width: tamanho, height: tamanho }">
      <img class="avatar-image" v-if="fotoUrl" :src="fotoUrl" :alt="`foto de ${nome}`">
    <div v-else class="avatar-placeholder">
      <span v-if="nome" class="avatar-inicial">{{ iniciais }}</span>
      <UserIcon v-else stroke-width="2"/>
    </div>
  </div>
</template>

<style scoped>
.user-avatar {
  border: 2px solid var(--color-background-alt);
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-primary);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--shadow-medium);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-inicial {
  font-size: 1rem;
  font-weight: 600;
}

.avatar-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>