# 🚀 GUIA COMPLETO DE DEPLOY - PARTE 2: CONFIGURAÇÃO DO PROJETO

## 📚 NESTA PARTE

Vamos preparar seu projeto para deploy. Cada arquivo, cada linha será explicada em detalhes.

---

## 1. CONFIGURAR VARIÁVEIS DE AMBIENTE

### 1.1 Backend - Arquivo `.env`

#### Passo 1: Criar o Arquivo

**Onde**: Na raiz da pasta `backend/`

**Como criar**:

```bash
cd backend
touch .env
```

**Ou**: Criar manualmente no VS Code

#### Passo 2: Conteúdo Completo Explicado

Abra `backend/.env` e cole:

```env
# ============================================
# CONFIGURAÇÕES DO SERVIDOR
# ============================================

# PORT: Porta onde o servidor vai rodar
# - Desenvolvimento: 3000 (padrão)
# - Produção: Plataforma define automaticamente (Render usa variável PORT)
PORT=3000

# NODE_ENV: Ambiente de execução
# - "development": Modo desenvolvimento (mais logs, sem otimizações)
# - "production": Modo produção (otimizado, menos logs)
NODE_ENV=development

# ============================================
# BANCO DE DADOS
# ============================================

# MONGO_URI: String de conexão do MongoDB
#
# DESENVOLVIMENTO (MongoDB local):
# MONGO_URI=mongodb://localhost:27017/medconnect
#
# PRODUÇÃO (MongoDB Atlas):
# MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/medconnect?retryWrites=true&w=majority
#
# Explicação da URL:
# - mongodb+srv:// = Protocolo (srv = DNS seedlist)
# - usuario:senha = Credenciais do banco
# - @cluster.mongodb.net = Endereço do cluster
# - /medconnect = Nome do banco de dados
# - ?retryWrites=true = Tenta novamente se falhar
# - &w=majority = Aguarda confirmação da maioria dos servidores

MONGO_URI=mongodb://localhost:27017/medconnect

# ============================================
# AUTENTICAÇÃO JWT
# ============================================

# JWT_SECRET: Chave secreta para assinar tokens JWT
#
# O que é JWT?
# - JSON Web Token: formato de token para autenticação
# - Quando usuário faz login, backend gera um token
# - Token é enviado em cada requisição para provar identidade
#
# Por que precisa de uma chave secreta?
# - Backend usa essa chave para "assinar" o token
# - Garante que token não foi adulterado
# - Só quem tem a chave consegue validar o token
#
# Como gerar uma chave forte?
# Execute no terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#
# IMPORTANTE: Use uma chave diferente em produção!

JWT_SECRET=sua-chave-secreta-aqui-min-32-caracteres

# ============================================
# EMAIL (NODEMAILER)
# ============================================

# Configurações para envio de emails
# Usado para: recuperação de senha, confirmação de cadastro, etc

# EMAIL_HOST: Servidor SMTP
# - Gmail: smtp.gmail.com
# - Outlook: smtp-mail.outlook.com
# - SendGrid: smtp.sendgrid.net
EMAIL_HOST=smtp.gmail.com

# EMAIL_PORT: Porta do servidor SMTP
# - 587: TLS (recomendado)
# - 465: SSL
# - 25: Sem criptografia (não use)
EMAIL_PORT=587

# EMAIL_USER: Seu email
EMAIL_USER=seu-email@gmail.com

# EMAIL_PASS: Senha do email
#
# ATENÇÃO GMAIL:
# Não use sua senha normal! Use "Senha de App"
#
# Como criar Senha de App no Gmail:
# 1. Acesse: https://myaccount.google.com/security
# 2. Ative "Verificação em duas etapas"
# 3. Vá em "Senhas de app"
# 4. Gere uma senha para "Email"
# 5. Cole aqui (16 caracteres sem espaços)
EMAIL_PASS=sua-senha-de-app-aqui

# EMAIL_FROM: Nome e email que aparece como remetente
EMAIL_FROM="MedConnect <noreply@medconnect.com>"

# ============================================
# CORS (FRONTEND URL)
# ============================================

# FRONTEND_URL: URL do frontend
# Backend usa isso para configurar CORS (permitir requisições)
#
# DESENVOLVIMENTO:
# FRONTEND_URL=http://localhost:5173
#
# PRODUÇÃO:
# FRONTEND_URL=https://seu-site.vercel.app

FRONTEND_URL=http://localhost:5173

# ============================================
# OUTRAS CONFIGURAÇÕES
# ============================================

# Se usar APIs externas, adicione aqui:
# VIACEP_API=https://viacep.com.br/ws
# OPENWEATHER_API_KEY=sua-chave-aqui
```

#### Passo 3: Atualizar `.env.example`

**Por quê?**

- `.env` não vai pro GitHub (tem senhas)
- `.env.example` vai pro GitHub (sem senhas)
- Outros desenvolvedores sabem quais variáveis precisam configurar

Abra `backend/.env.example` e cole:

```env
# Copie este arquivo para .env e preencha os valores

# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
MONGO_URI=

# Autenticação
JWT_SECRET=

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Passo 4: Garantir que `.env` Não Vai pro Git

Abra `backend/.gitignore` e verifique se tem:

```
node_modules/
dist/
.env
*.log
.DS_Store
```

**Se não tiver**, adicione `.env` na lista.

---

### 1.2 Frontend - Arquivo `.env`

#### Passo 1: Criar Arquivos de Ambiente

**Por que dois arquivos?**

- `.env.development`: Usado quando roda `npm run dev`
- `.env.production`: Usado quando roda `npm run build`

**Criar** `frontend/.env.development`:

```env
# ============================================
# DESENVOLVIMENTO
# ============================================

# VITE_API_URL: URL do backend
#
# Por que VITE_ no início?
# - Vite só expõe variáveis que começam com VITE_
# - Segurança: impede expor variáveis sensíveis no frontend
#
# Desenvolvimento: backend local
VITE_API_URL=http://localhost:3000

# Se quiser testar com backend em produção:
# VITE_API_URL=https://seu-backend.onrender.com
```

**Criar** `frontend/.env.production`:

```env
# ============================================
# PRODUÇÃO
# ============================================

# VITE_API_URL: URL do backend em produção
#
# Deploy Separado:
# VITE_API_URL=https://seu-backend.onrender.com
#
# Deploy Único (mesmo domínio):
# VITE_API_URL=/api

VITE_API_URL=https://seu-backend.onrender.com
```

#### Passo 2: Usar no Código

Abra `frontend/src/plugins/axios.ts` e atualize:

```typescript
import axios from "axios";

// Cria instância do axios com configurações padrão
const api = axios.create({
  // baseURL: URL base para todas as requisições
  // import.meta.env.VITE_API_URL: Pega da variável de ambiente
  // || 'http://localhost:3000': Fallback se variável não existir
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

  // timeout: Tempo máximo de espera (10 segundos)
  // Se backend não responder em 10s, cancela requisição
  timeout: 10000,

  // headers: Cabeçalhos enviados em todas as requisições
  headers: {
    "Content-Type": "application/json", // Envia/recebe JSON
  },
});

// Interceptor: Executa ANTES de cada requisição
api.interceptors.request.use(
  (config) => {
    // Pega token do localStorage (salvo no login)
    const token = localStorage.getItem("token");

    // Se token existe, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Retorna config modificada
    return config;
  },
  (error) => {
    // Se der erro ao preparar requisição
    return Promise.reject(error);
  },
);

// Interceptor: Executa DEPOIS de cada resposta
api.interceptors.response.use(
  (response) => {
    // Se resposta OK (status 200-299), retorna dados
    return response;
  },
  (error) => {
    // Se erro (status 400+)

    // Se erro 401 (não autorizado), redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
```

**Como usar no componente**:

```typescript
// Em qualquer componente Vue
import api from "@/plugins/axios";

// Fazer requisição
const buscarUsuarios = async () => {
  try {
    // GET http://localhost:3000/usuarios
    // (baseURL + /usuarios)
    const response = await api.get("/usuarios");
    console.log(response.data);
  } catch (error) {
    console.error("Erro:", error);
  }
};
```

---

## 2. ATUALIZAR CONFIGURAÇÕES DO BACKEND

### 2.1 Arquivo `backend/src/server.ts`

Abra `backend/src/server.ts` e substitua por:

```typescript
// ============================================
// IMPORTS
// ============================================

// Carrega variáveis de ambiente do arquivo .env
// IMPORTANTE: Deve ser a primeira linha!
import "dotenv/config";

// Express: Framework para criar API
import express from "express";

// Mongoose: ODM para MongoDB (Object Document Mapper)
import mongoose from "mongoose";

// CORS: Permite requisições de outros domínios
import cors from "cors";

// Rotas da aplicação
import authRoutes from "./routes/auth.routes";
import agendamentoRoutes from "./routes/agendamento.routes";
import cepRoutes from "./routes/cep.routes";

// ============================================
// CRIAR APLICAÇÃO EXPRESS
// ============================================

const app = express();

// ============================================
// CONFIGURAR CORS
// ============================================

// Lista de origens permitidas
// Em desenvolvimento: localhost
// Em produção: domínio do frontend
const allowedOrigins = process.env.FRONTEND_URL
  ? [
      process.env.FRONTEND_URL, // URL de produção
      "http://localhost:5173", // Desenvolvimento
      "http://localhost:5174", // Desenvolvimento (porta alternativa)
    ]
  : ["http://localhost:5173"]; // Fallback

// Configurar CORS
app.use(
  cors({
    // origin: Quais domínios podem fazer requisições
    // Pode ser:
    // - String: 'https://meu-site.com'
    // - Array: ['https://site1.com', 'https://site2.com']
    // - Função: (origin, callback) => { ... }
    origin: allowedOrigins,

    // methods: Métodos HTTP permitidos
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    // allowedHeaders: Cabeçalhos permitidos
    allowedHeaders: ["Content-Type", "Authorization"],

    // credentials: Permite envio de cookies
    credentials: true,
  }),
);

// ============================================
// MIDDLEWARES
// ============================================

// express.json(): Parseia body das requisições como JSON
// Sem isso, req.body seria undefined
app.use(express.json());

// express.urlencoded(): Parseia dados de formulários
app.use(express.urlencoded({ extended: true }));

// ============================================
// HEALTH CHECK
// ============================================

// Rota para verificar se servidor está funcionando
// Útil para monitoramento (UptimeRobot, etc)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Tempo que servidor está rodando (segundos)
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// ROTAS DA API
// ============================================

// Registrar rotas
// Todas as rotas de auth começam com /auth
app.use("/auth", authRoutes);

// Todas as rotas de agendamentos começam com /agendamentos
app.use("/agendamentos", agendamentoRoutes);

// Todas as rotas de CEP começam com /cep
app.use("/cep", cepRoutes);

// ============================================
// ROTA 404 (NÃO ENCONTRADA)
// ============================================

// Se nenhuma rota anterior respondeu, retorna 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
  });
});

// ============================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================

// Middleware de erro (4 parâmetros)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Erro:", err);

    res.status(err.status || 500).json({
      error: err.message || "Erro interno do servidor",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  },
);

// ============================================
// CONECTAR AO MONGODB
// ============================================

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/medconnect";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Conectado ao MongoDB");
    console.log(`📍 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
    // Em produção, encerra processo se não conectar ao banco
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

// ============================================
// INICIAR SERVIDOR
// ============================================

// Porta: usa variável de ambiente ou 3000
// Plataformas como Render definem a porta automaticamente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// ============================================
// TRATAMENTO DE SINAIS (GRACEFUL SHUTDOWN)
// ============================================

// Quando receber sinal de encerramento (Ctrl+C, deploy, etc)
process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM recebido. Encerrando gracefully...");

  // Fecha conexão com MongoDB
  mongoose.connection
    .close()
    .then(() => {
      console.log("✅ MongoDB desconectado");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Erro ao desconectar MongoDB:", err);
      process.exit(1);
    });
});
```

**O que mudou?**

1. ✅ CORS configurado para produção
2. ✅ Health check endpoint
3. ✅ Tratamento de erros global
4. ✅ Graceful shutdown
5. ✅ Logs mais informativos
6. ✅ Rota 404

---

## 3. ATUALIZAR CONFIGURAÇÕES DO FRONTEND

### 3.1 Arquivo `frontend/vite.config.ts`

Abra `frontend/vite.config.ts` e substitua por:

```typescript
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  // ============================================
  // PLUGINS
  // ============================================

  // Plugin do Vue 3
  plugins: [vue()],

  // ============================================
  // BASE PATH
  // ============================================

  // base: Caminho base da aplicação
  //
  // Domínio próprio: '/'
  // GitHub Pages: '/nome-do-repo/'
  //
  // Exemplo:
  // base: '/' → https://seu-site.com/
  // base: '/medconnect/' → https://seu-site.com/medconnect/
  base: "/",

  // ============================================
  // RESOLVE (ALIAS)
  // ============================================

  resolve: {
    alias: {
      // '@' aponta para 'src/'
      // Permite: import Component from '@/components/Component.vue'
      // Em vez de: import Component from '../../components/Component.vue'
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // ============================================
  // BUILD (PRODUÇÃO)
  // ============================================

  build: {
    // outDir: Pasta de saída do build
    outDir: "dist",

    // sourcemap: Gera arquivos .map para debug
    // false em produção (arquivos menores)
    sourcemap: false,

    // minify: Minifica código (remove espaços, comentários)
    // 'esbuild' é mais rápido que 'terser'
    minify: "esbuild",

    // chunkSizeWarningLimit: Avisa se chunk > 500kb
    chunkSizeWarningLimit: 500,

    // rollupOptions: Configurações avançadas
    rollupOptions: {
      output: {
        // manualChunks: Divide código em chunks
        // Melhora cache (se Vue atualizar, só baixa chunk do Vue)
        manualChunks: {
          // Chunk com Vue, Vue Router e Pinia
          "vue-vendor": ["vue", "vue-router", "pinia"],

          // Chunk com Axios
          "axios-vendor": ["axios"],
        },
      },
    },
  },

  // ============================================
  // SERVER (DESENVOLVIMENTO)
  // ============================================

  server: {
    // port: Porta do servidor de desenvolvimento
    port: 5173,

    // open: Abre navegador automaticamente
    open: false,

    // cors: Habilita CORS no dev server
    cors: true,

    // proxy: Proxy para evitar CORS em desenvolvimento
    // Útil se backend não tiver CORS configurado
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },
});
```

**O que mudou?**

1. ✅ `base: '/'` para domínio próprio
2. ✅ Build otimizado com chunks
3. ✅ Comentários explicando cada opção

---

## 4. SCRIPTS DE BUILD

### 4.1 Backend - `package.json`

Abra `backend/package.json` e verifique os scripts:

```json
{
  "scripts": {
    // dev: Desenvolvimento com hot reload
    // tsx: Executa TypeScript diretamente (sem compilar)
    "dev": "tsx watch src/server.ts",

    // build: Compila TypeScript para JavaScript
    // tsc: TypeScript Compiler
    // Cria pasta dist/ com arquivos .js
    "build": "tsc",

    // start: Produção (roda código compilado)
    // Plataformas como Render executam este comando
    "start": "node dist/server.js",

    // start:prod: Produção com NODE_ENV=production
    "start:prod": "NODE_ENV=production node dist/server.js"
  }
}
```

**Se não tiver `tsx watch`**, instale:

```bash
cd backend
npm install --save-dev tsx
```

### 4.2 Frontend - `package.json`

Abra `frontend/package.json` e verifique os scripts:

```json
{
  "scripts": {
    // dev: Desenvolvimento
    // Inicia Vite dev server na porta 5173
    "dev": "vite",

    // build: Produção
    // 1. vue-tsc -b: Verifica tipos TypeScript
    // 2. vite build: Compila e otimiza código
    // Cria pasta dist/ com arquivos otimizados
    "build": "vue-tsc -b && vite build",

    // preview: Visualizar build localmente
    // Serve pasta dist/ para testar antes do deploy
    "preview": "vite preview"
  }
}
```

---

## 5. CONFIGURAR MONGODB ATLAS

### 5.1 Criar Conta

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Clique em "Try Free"
3. Crie conta (pode usar Google/GitHub)

### 5.2 Criar Cluster

1. Escolha "M0 Free" (512MB grátis)
2. Provider: AWS
3. Region: Escolha mais próxima (ex: São Paulo)
4. Cluster Name: "MedConnect" (ou qualquer nome)
5. Clique em "Create"

**Aguarde 3-5 minutos** para cluster ser criado.

### 5.3 Criar Usuário do Banco

1. No menu lateral, clique em "Database Access"
2. Clique em "Add New Database User"
3. Authentication Method: "Password"
4. Username: `medconnect_user`
5. Password: Clique em "Autogenerate Secure Password" e **copie a senha**
6. Database User Privileges: "Read and write to any database"
7. Clique em "Add User"

**⚠️ IMPORTANTE**: Salve a senha em local seguro!

### 5.4 Permitir Acesso de Qualquer IP

1. No menu lateral, clique em "Network Access"
2. Clique em "Add IP Address"
3. Clique em "Allow Access from Anywhere"
4. IP Address: `0.0.0.0/0` (já preenchido)
5. Clique em "Confirm"

**Por quê?**

- Seu backend pode estar em qualquer servidor
- Render, Vercel, etc usam IPs dinâmicos
- `0.0.0.0/0` permite qualquer IP

**É seguro?**

- ✅ Sim! Ainda precisa de usuário e senha
- ✅ MongoDB Atlas tem firewall próprio
- ✅ Conexão é criptografada (TLS/SSL)

### 5.5 Obter Connection String

1. Volte para "Database" (menu lateral)
2. Clique em "Connect" no seu cluster
3. Escolha "Connect your application"
4. Driver: "Node.js"
5. Version: "5.5 or later"
6. Copie a connection string:

```
mongodb+srv://medconnect_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Substitua `<password>`** pela senha que você copiou
8. **Adicione o nome do banco** antes do `?`:

```
mongodb+srv://medconnect_user:SUA_SENHA@cluster0.xxxxx.mongodb.net/medconnect?retryWrites=true&w=majority
```

### 5.6 Testar Conexão

Abra `backend/.env` e atualize:

```env
MONGO_URI=mongodb+srv://medconnect_user:SUA_SENHA@cluster0.xxxxx.mongodb.net/medconnect?retryWrites=true&w=majority
```

Teste:

```bash
cd backend
npm run dev
```

Deve aparecer:

```
✅ Conectado ao MongoDB
📍 Database: medconnect
```

---

## 6. TESTAR LOCALMENTE

### 6.1 Testar Backend

```bash
cd backend
npm run dev
```

Acesse: http://localhost:3000/health

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

### 6.2 Testar Frontend

```bash
cd frontend
npm run dev
```

Acesse: http://localhost:5173

Teste fazer login, cadastro, etc.

### 6.3 Testar Integração

1. Frontend rodando em `localhost:5173`
2. Backend rodando em `localhost:3000`
3. Faça login no frontend
4. Verifique no Network (F12) se requisições estão funcionando

---

**CONTINUA NA PARTE 3...**

Próximos tópicos:

- Deploy do Backend no Render
- Deploy do Frontend no Vercel
- Configurar variáveis de ambiente nas plataformas
- Testar aplicação em produção
