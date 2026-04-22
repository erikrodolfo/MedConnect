import axios from "axios";
import router from "../router"; //porta de saída

const api = axios.create({
  baseURL: "http://localhost:3000", //enredeço fixo do node.js
});

//Interceptar a requisição - Antes de QUALQUER chamada sair do Vue, ele grampeia o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//Interceptar a resposta - Fica vigiando o que o Node.js devolve. Se voltar 401, ele executa o plano de contenção.
axios.get("/");

api.interceptors.response.use(
  (response) => {
    return response; // Se deu 200 OK, deixa o dado passar livre para a tela.
  },
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      if (!error.config.skipAuthRedirect) {
        console.warn(
          "[interceptor]Sessão expirada ou token inválido. Expulsando usuário...",
        );
        localStorage.removeItem("token");
        router.push("/login"); //se deu erro ele remove o token e te leva para a tela de login
      }
    }
    return Promise.reject(error);
  },
);

export default api;
