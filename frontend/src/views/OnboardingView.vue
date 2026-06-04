<script setup lang="ts">
//imports vue
import { ref } from "vue";
import { useRouter } from "vue-router";

//biblioteca de notificações
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

//api do backend
import api from "../services/api";

//Layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthHeader from "../layouts/AuthHeader.vue";
import AuthCard from "../layouts/AuthCard.vue";

//Componentes
import ImageUpload from "../components/ui/ImageUpload.vue";
import BaseButton from "../components/ui/BaseButton.vue";

//Variáveis reativas
const fotoPerfil = ref<File | null>(null);
const loading = ref(false);

//roteador
const router = useRouter();

const pular = () => {
  //caso não queira por a foto agora
  router.push("/dashboard");
};

const enviarFoto = async () => {
  loading.value = true;

  try {
    if (!fotoPerfil.value) {
      //se não tem foto. apenas vai para o dashboard
      router.push("/dashboard");
      return;
    }

    //se tem foto, envia e vai pro dashboard
    const formData = new FormData();
    if (fotoPerfil.value) {
      formData.append("fotoPerfil", fotoPerfil.value);
    }

    await api.patch("/auth/perfil/foto", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success("Foto adicionada!");
    router.push("/dashboard");
  } catch (error: any) {
    toast.error(error.response?.data?.erro || "Erro ao enviar foto");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard>
      <!--Início Header-->
      <AuthHeader
        title="Seja Bem Vindo!"
        subtitle="Adicione sua foto de perfil"
      />
      <!--Fim Header-->

      <!--início Componente de upload-->
      <ImageUpload v-model="fotoPerfil" />
      <!--Fim Componente de upload-->

      <!--Botões-->
      <BaseButton
        class="skip-button"
        @click="pular"
        variant="secondary"
        :loading="loading"
      >
        {{ !loading ? "Pular" : "Pulando..." }}
      </BaseButton>

      <BaseButton @click="enviarFoto" :loading="loading">
        {{ !loading ? "Enviar foto" : "Enviando..." }}
      </BaseButton>
      <!--FIm botões-->
    </AuthCard>
  </AuthLayout>
</template>

<style scoped>
:deep(.auth-header h1) {
  text-align: center;
}

:deep(.auth-header p.subtitle) {
  text-align: center;
}

.skip-button {
  background-image: linear-gradient(
    45deg,
    var(--color-background),
    var(--color-surface)
  );
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--color-error);
  font-size: 0.9rem;
  text-align: center;
  margin: 1rem 0;
}

@keyframes spinner {
  to {
    transform: rotate(0deg);
  }

  from {
    transform: rotate(360deg);
  }
}
</style>
