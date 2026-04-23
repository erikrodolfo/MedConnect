import axios from "axios";
import router from "../router"; // Porta de saída - usado para redirecionar usuário

// Cria a instância do axios com configuração padrão
const api = axios.create({
  // baseURL: URL base para todas as requisições
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000", //pega a variável de ambiente || fallback se a varável não existir

  // timeout: Tempo máximo de espera (10 segundos)
  // Se o backend não responder em 10s, cancela a requisição
  timeout: 10000,

  // headers: Cabeçalhos enviados em todas as requisições
  headers: {
    "Content-Type": "application/json", // Envia/Recebe JSON
  },
});

// Interceptor: Executa antes de cada requisição
// Antes de QUALQUER chamada sair do Vue, ele grampeia o token automaticamente
api.interceptors.request.use(
  (config) => {
    // Pega token do localStorage (salvo no login)
    const token = localStorage.getItem("token");

    // Se token existe, adiciona no header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Retorna config modificada
    return config;
  },
  (error) => {
    // Se der erro ao preparar a requisição
    return Promise.reject(error);
  },
);

// ============================================
// INTERCEPTOR DE RESPOSTA
// ============================================

// Interceptor: Executa depois de cada resposta
// Fica vigiando o que o Node.js devolve. Se voltar 401, ele executa o plano de contenção.
api.interceptors.response.use(
  (response) => {
    // Se resposta OK (status 200-299), deixa o dado passar livre para a tela
    return response;
  },
  (error) => {
    // Se erro (status 400+)

    // Se erro 401 (não autorizado) ou 403 (proibido)
    if (error.response && [401, 403].includes(error.response.status)) {
      // skipAuthRedirect: flag para pular redirecionamento (usado em casos específicos)
      if (!error.config.skipAuthRedirect) {
        console.warn(
          "[interceptor] Sessão expirada ou token inválido. Expulsando usuário...",
        );

        // Remove token inválido
        localStorage.removeItem("token");

        // Redireciona para login
        router.push("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
