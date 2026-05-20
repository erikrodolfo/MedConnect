import { defineStore } from "pinia";
import api from "../services/api";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  fotoPerfil: string | null;
  role: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
}

interface UsuarioState {
  usuario: Usuario | null;
  carregando: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UsuarioState => ({
    usuario: null,
    carregando: false,
  }),
  actions: {
    async buscarPerfil() {
      this.carregando = true;
      try {
        const resposta = await api.get("/auth/perfil");
        this.usuario = resposta.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.carregando = false;
      }
    },

    atualizarFoto(fotoPerfil: string) {
      if (this.usuario) {
        this.usuario.fotoPerfil = fotoPerfil;
      }
    },
    limparUsuario() {
      this.usuario = null;
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");
    },
  },
});
