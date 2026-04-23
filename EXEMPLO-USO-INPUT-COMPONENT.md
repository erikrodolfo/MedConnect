# 📝 Como Usar o Componente InputField

## 🎯 Exemplo de Uso no LoginView.vue

### 1️⃣ Importar o Componente

```javascript
import InputField from "@/components/InputField.vue";
import { Mail, LockKeyholeIcon, Eye, EyeOff } from "@lucide/vue";
```

### 2️⃣ Usar no Template

#### Input de Email (simples):

```vue
<InputField
  v-model="email"
  type="email"
  placeholder="Digite seu email"
  name="email"
  id="email"
  :required="true"
  autocomplete="none"
  :left-icon="Mail"
/>
```

#### Input de Senha (com toggle):

```vue
<InputField
  v-model="senha"
  type="password"
  placeholder="Digite sua senha"
  name="senha"
  id="senha"
  :required="true"
  :left-icon="LockKeyholeIcon"
  :right-icon="mostrarSenha ? Eye : EyeOff"
  :show-password="mostrarSenha"
  @toggle="toggleSenha"
/>
```

---

## 📋 Props Disponíveis

| Prop           | Tipo      | Padrão          | Descrição                                      |
| -------------- | --------- | --------------- | ---------------------------------------------- |
| `modelValue`   | String    | `''`            | Valor do input (v-model)                       |
| `type`         | String    | `'text'`        | Tipo do input (text, email, password, etc)     |
| `placeholder`  | String    | `''`            | Texto placeholder                              |
| `name`         | String    | **obrigatório** | Atributo name do input                         |
| `id`           | String    | **obrigatório** | Atributo id do input                           |
| `required`     | Boolean   | `false`         | Se o campo é obrigatório                       |
| `autocomplete` | String    | `'off'`         | Atributo autocomplete                          |
| `leftIcon`     | Component | `null`          | Ícone à esquerda (componente Lucide)           |
| `rightIcon`    | Component | `null`          | Ícone à direita (componente Lucide)            |
| `showPassword` | Boolean   | `false`         | Se deve mostrar a senha (para type="password") |

---

## 🎪 Eventos Emitidos

| Evento              | Quando                        | Uso                  |
| ------------------- | ----------------------------- | -------------------- |
| `update:modelValue` | Quando o usuário digita       | Atualiza o v-model   |
| `toggle`            | Quando clica no ícone direito | Para toggle de senha |

---

## 🔄 Exemplo Completo de Refatoração

### ❌ Antes (código antigo):

```vue
<template>
  <form @submit.prevent="fazerLogin">
    <div class="input-wrapper">
      <mail class="input-icon" :size="20" :stroke-width="2" />
      <input
        v-model="email"
        type="email"
        placeholder="Digite seu email"
        name="email"
        id="email"
        required
        autocomplete="none"
      />
    </div>

    <div class="input-wrapper">
      <LockKeyholeIcon class="input-icon" :size="20" stroke-width="2" />
      <input
        v-model="senha"
        :type="mostrarSenha ? 'text' : 'password'"
        placeholder="Digite sua senha"
        name="senha"
        id="senha"
        required
      />
      <Eye
        @click="toggleSenha"
        class="toggle-icon-password"
        :size="20"
        stroke-width="2"
        v-if="mostrarSenha"
      />
      <EyeOff
        @click="toggleSenha"
        class="toggle-icon-password"
        :size="20"
        stroke-width="2"
        v-else
      />
    </div>
  </form>
</template>
```

### ✅ Depois (com componente):

```vue
<template>
  <form @submit.prevent="fazerLogin">
    <!-- Input Email -->
    <InputField
      v-model="email"
      type="email"
      placeholder="Digite seu email"
      name="email"
      id="email"
      :required="true"
      autocomplete="none"
      :left-icon="Mail"
    />

    <!-- Input Senha -->
    <InputField
      v-model="senha"
      type="password"
      placeholder="Digite sua senha"
      name="senha"
      id="senha"
      :required="true"
      :left-icon="LockKeyholeIcon"
      :right-icon="mostrarSenha ? Eye : EyeOff"
      :show-password="mostrarSenha"
      @toggle="toggleSenha"
    />
  </form>
</template>

<script setup>
import InputField from "@/components/InputField.vue";
import { Mail, LockKeyholeIcon, Eye, EyeOff } from "@lucide/vue";
import { ref } from "vue";

const email = ref("");
const senha = ref("");
const mostrarSenha = ref(false);

const toggleSenha = () => {
  mostrarSenha.value = !mostrarSenha.value;
};

const fazerLogin = async () => {
  // ... sua lógica de login
};
</script>
```

---

## 🎨 Personalizando Estilos

Se você quiser estilos diferentes em páginas específicas, pode:

### Opção 1: Usar classes CSS globais

```vue
<InputField v-model="email" class="meu-input-customizado" ... />
```

```css
/* No seu CSS */
.meu-input-customizado input {
  border-color: blue;
}
```

### Opção 2: Adicionar prop de variante

Você pode expandir o componente para aceitar variantes:

```javascript
// No InputField.vue
const props = defineProps({
  // ... outras props
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "outlined", "filled"].includes(value),
  },
});
```

---

## 🚀 Vantagens de Usar o Componente

✅ **Reutilização:** Use em Login, Cadastro, Recuperação de Senha, etc  
✅ **Consistência:** Todos os inputs têm o mesmo estilo  
✅ **Manutenção:** Muda em um lugar, atualiza em todos  
✅ **Menos código:** Menos linhas repetidas  
✅ **Mais limpo:** Template mais legível

---

## 📦 Onde Usar

- ✅ LoginView.vue
- ✅ CadastroView.vue
- ✅ ForgotPasswordView.vue
- ✅ ResetPasswordView.vue
- ✅ Qualquer formulário futuro

---

## 🎯 Próximos Passos

1. Importe o componente no LoginView
2. Substitua os inputs antigos pelo componente
3. Teste se tudo funciona
4. Repita para outras páginas (Cadastro, Recuperação, etc)

---

**💡 Dica:** Comece substituindo um input por vez e testando, não faça tudo de uma vez!
