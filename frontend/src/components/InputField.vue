<template>
  <div class="input-wrapper">
    <!-- Ícone à esquerda -->
    <component
      v-if="leftIcon"
      :is="leftIcon"
      class="input-icon"
      :size="20"
      :stroke-width="2"
    />

    <!-- Input -->
    <input
      :type="computedType"
      :placeholder="placeholder"
      :name="name"
      :id="id"
      :required="required"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :readonly="readonly"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    />
    <!--Emit avisando ao pai que escreveram algo no email-->

    <!-- Ícone de toggle (para senha) -->
    <component
      v-if="rightIcon"
      :is="rightIcon"
      @click="$emit('toggle')"
      class="toggle-icon-password"
      :size="20"
      :stroke-width="2"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: "on",
  },
  minlength: {
    type: Number,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  leftIcon: {
    type: [Object, Function],
    default: null,
  },
  rightIcon: {
    type: [Object, Function],
    default: null,
  },
  showPassword: {
    type: Boolean,
    default: false,
  },
});

// Emits avisando ao "pai"
defineEmits(["update:modelValue", "toggle", "blur"]);

// Computed
const computedType = computed(() => {
  // Se for campo de senha e showPassword for true, mostra como text
  if (props.type === "password" && props.showPassword) {
    return "text";
  }
  return props.type;
});
</script>

<style scoped>
/* Input wrapper */
.input-wrapper {
  position: relative;
  width: 100%;
}

/* Input - Mobile (padrão) */
input {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-surface);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
  font-family: var(--primary-font);
  font-size: 1rem;
  padding: 12px 12px 12px 2.25rem;
  margin: 10px 1rem;
  width: 14.9rem;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  -webkit-box-shadow: 0px 0px 123px 35px rgba(232, 238, 255, 0.4);
  -moz-box-shadow: 0px 0px 123px 35px rgba(232, 238, 255, 0.4);
  box-shadow: 0px 0px 123px 35px rgba(232, 238, 255, 0.4);
}

input::placeholder {
  color: var(--color-text-secondary);
}

/* Ícone à esquerda - Mobile */
.input-icon {
  color: var(--color-text-secondary);
  position: absolute;
  left: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  pointer-events: none;
}

/* Ícone à direita (toggle senha) - Mobile */
.toggle-icon-password {
  color: var(--color-text-secondary);
  position: absolute;
  right: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Quando o input está focado, muda cor dos ícones */
.input-wrapper:focus-within .input-icon {
  color: var(--color-primary);
}

.input-wrapper:focus-within .toggle-icon-password {
  color: var(--color-primary);
}

/* Autofill do navegador */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px var(--color-surface) inset !important;
  -webkit-text-fill-color: var(--color-text-primary) !important;
  font-family: var(--primary-font) !important;
  font-size: 1rem !important;
  caret-color: var(--color-text-primary) !important;
}

/* ========================================
   TABLET (768px+)
   ======================================== */
@media screen and (min-width: 768px) and (max-width: 1299px) {
  input {
    width: 20rem;
    padding: 13px 15px 13px 2rem;
    margin: 10px 10px;
    font-size: 1.2rem;
    transition: all 0.3s ease-in-out;
  }

  input:hover {
    border: 1px solid var(--color-secondary);
    -webkit-box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
    -moz-box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
    box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
  }

  .input-icon {
    left: 1.1rem;
    transition: color 0.3s ease-in-out;
  }

  .toggle-icon-password {
    right: 1.1rem;
  }
  /* Autofill do navegador */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--color-surface) inset !important;
    -webkit-text-fill-color: var(--color-text-primary) !important;
    font-family: var(--primary-font) !important;
    font-size: 1.2rem !important;
    caret-color: var(--color-text-primary) !important;
  }
}

/* ========================================
   DESKTOP (1300px+)
   ======================================== */
@media screen and (min-width: 1300px) {
  input {
    width: 20.5rem;
    padding: 15px 15px 15px 2.3rem;
    margin: 10px 10px;
    transition: all 0.3s ease-in-out;
    font-size: 1.2rem;
  }

  input:hover {
    border: 1px solid var(--color-secondary);
    -webkit-box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
    -moz-box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
    box-shadow: 0px 0px 15px 3px rgba(33, 118, 255, 0.19);
  }

  .input-icon {
    left: 1.3rem;
    transition: color 0.3s ease-in-out;
  }

  .toggle-icon-password {
    right: 1.3rem;
  }

  /* Autofill do navegador */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--color-surface) inset !important;
    -webkit-text-fill-color: var(--color-text-primary) !important;
    font-family: var(--primary-font) !important;
    font-size: 1.2rem !important;
    caret-color: var(--color-text-primary) !important;
  }
}
</style>
