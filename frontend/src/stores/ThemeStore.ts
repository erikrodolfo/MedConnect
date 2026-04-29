import { defineStore } from "pinia";

export type Theme = "light" | "dark"; //evita valores inválidos e previne bugs

interface ThemeState {
  theme: Theme;
}

export const useThemeStore = defineStore("theme", {
  state: (): ThemeState => ({
    theme: "light"
  }),

  actions: {
    setTheme(newTheme: Theme) {
      this.theme = newTheme;
    },

    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
    },
  },
});
