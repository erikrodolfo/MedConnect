import { onMounted, watch } from "vue";
import { useThemeStore, type Theme } from "../stores/ThemeStore";

export function useTheme() {
  const store = useThemeStore() //vem do pinia, conecta o composable ao estado global

  const applyTheme = (theme: Theme): void => { //função para acessar o html da página e adicionar um atributo
    document.documentElement.setAttribute('data-theme', theme) //esse atributo
  }

  onMounted(() => { //ativa assim que o componente aparece na tela
    const saved = localStorage.getItem('theme') as Theme | null //pega o tema salvo no navegador
    
    if (saved === 'light' || saved === 'dark') { //verificando se o valor é válido/ se não for, usa o tema do sistema
      store.setTheme(saved)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches //verificando preferência do sistema operacional

      store.setTheme(prefersDark ? 'dark' : 'light') //atualizando no estado global | store (pinia)
    }

    applyTheme(store.theme) //aplicando no HTML
  })

  watch( //atualiza a cada mudança
    () => store.theme, //sempre que o tema mudar
    (newTheme: Theme) => {
      applyTheme(newTheme) //aplica no html
      localStorage.setItem('theme', newTheme) //salva no localStorage
    }
  )

  return {
    theme: store.theme, //expõe o valor atual
    toggleTheme: store.toggleTheme //função do pinia que altera o tema
  }
}