import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";


// https://vite.dev/config/
export default defineConfig({
  //plugins
  plugins: [vue()], //plugin do vue3
  //base path - caminho na apliacação
  base: "/", //saída -> https://meu-site.com/

  //resolve - Alias
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), //aponta para o 'src/' | usa '@/component em vez de ../../component
    },
  },
  //build | produção
  build: {
    outDir: "dist", //pasta de saída do build
    sourcemap: false, //gera arquivos .map para debug | false em produção (arquivos menores)
    minify: "esbuild", //minifica código(retira espaços, comentários) | 'esbuild' é mais rápido que 'terser'
    chunkSizeWarningLimit: 500, //avisa se chunck > 500

    //configurações avançadas
    rollupOptions: {
      output: {
        // manualChunks: Divide código em chunks separados
        // Melhora cache (se Vue atualizar, só baixa chunk do Vue)
        manualChunks: (id) => {
          // Se o módulo está em node_modules
          if (id.includes("node_modules")) {
            // Chunk com Vue, Vue Router e Pinia
            if (id.includes("vue") || id.includes("pinia")) {
              return "vue-vendor";
            }
            // Chunk com Axios
            if (id.includes("axios")) {
              return "axios-vendor";
            }
          }
        },
      },
    },
  },
  //server de desenvolvimento
server: {
  port: 5173, //porta do servidor de desenvolvimento
  open: false, // Abre navegador automaticamente
  cors: true, //Habilita CORS no dev server
}

});

