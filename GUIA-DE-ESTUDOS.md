# 📚 GUIA DE ESTUDOS - Sistema de Clínica MedConnect

> **🎯 Objetivo:** Te ajudar a entender TODO o fluxo do projeto, desde quando o usuário abre o navegador até quando os dados chegam no banco de dados.

---

## 📑 Índice

1. [Visão Geral do Sistema](#-visão-geral-do-sistema)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Fluxo de Login Completo](#-fluxo-de-login-completo)
4. [Sistema de Autenticação](#-sistema-de-autenticação)
5. [Sistema de Recuperação de Senha](#-sistema-de-recuperação-de-senha)
6. [Sistema de Agendamentos](#-sistema-de-agendamentos)
7. [Banco de Dados](#-banco-de-dados)
8. [Frontend Vue.js](#-frontend-vuejs)
9. [Ferramentas e Conceitos](#-ferramentas-e-conceitos)
10. [Problemas Comuns](#-problemas-comuns)
11. [Próximos Passos](#-próximos-passos)

---

## 🎯 Visão Geral do Sistema

### O que é este sistema?

Sistema de agendamento de consultas médicas com controle de acesso por níveis.

### 👥 Tipos de Usuários

| Tipo           | Permissões                                    | Status          |
| -------------- | --------------------------------------------- | --------------- |
| **PACIENTE**   | Agendar e cancelar suas próprias consultas    | ✅ Implementado |
| **SECRETARIO** | Ver todas as consultas (permissões limitadas) | 🔄 Futuro       |
| **ADMIN**      | Ver e gerenciar todas as consultas            | ✅ Implementado |

---

## 🏗️ Arquitetura do Projeto

### 📊 Diagrama Geral

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   FRONTEND      │         │    BACKEND      │         │   BANCO DE      │
│   (Vue.js)      │ ◄────► │   (Node.js)     │ ◄────► │   DADOS         │
│   Port: 5173    │  HTTP   │   Port: 3000    │  TCP    │   (MongoDB)     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

### 🎨 Frontend (Vue.js)

**🌐 URL:** `http://localhost:5173`

**📁 Estrutura de Pastas:**

```
frontend/src/
├── 📄 views/          → Páginas completas (Login, Cadastro, Dashboard)
├── 🧩 components/     → Componentes reutilizáveis
├── 🛣️  router/         → Configuração de rotas
├── 🔌 services/       → Comunicação com backend (API)
├── 🔧 plugins/        → Configurações de bibliotecas
└── 🎨 styles/         → Arquivos CSS
```

**🔑 Arquivos Principais:**

| Arquivo                        | Função                               |
| ------------------------------ | ------------------------------------ |
| `views/LoginView.vue`          | Tela de login                        |
| `views/ForgotPasswordView.vue` | Solicitar recuperação de senha       |
| `views/ResetPasswordView.vue`  | Redefinir senha                      |
| `services/api.ts`              | Configuração do Axios + Interceptors |
| `router/index.ts`              | Rotas e proteção de páginas          |

---

### ⚙️ Backend (Node.js + Express)

**🌐 URL:** `http://localhost:3000`

**📁 Estrutura de Pastas:**

```
backend/src/
├── 📊 models/         → Schemas do MongoDB (Usuario, Agendamento)
├── 🎮 controllers/    → Lógica de negócio
├── 🛠️  services/       → Funções auxiliares (email, clima, CEP)
├── 🛡️  middlewares/    → Autenticação e autorização
└── 🛣️  routes/         → Definição de endpoints
```

**🔑 Arquivos Principais:**

| Arquivo                          | Função                                |
| -------------------------------- | ------------------------------------- |
| `controllers/auth.controller.ts` | Login, registro, recuperação de senha |
| `services/email.service.ts`      | Envio de emails (Nodemailer)          |
| `middlewares/auth.middleware.ts` | Validação de token JWT                |
| `models/Usuario.ts`              | Schema do usuário no MongoDB          |

---

### 🗄️ Banco de Dados (MongoDB)

**🌐 URL:** `mongodb://localhost:27017/clinica`

**📦 Collections (Tabelas):**

| Collection     | Descrição                 | Campos Principais            |
| -------------- | ------------------------- | ---------------------------- |
| `usuarios`     | Dados de login e endereço | email, senha, role, cidade   |
| `agendamentos` | Consultas marcadas        | pacienteId, dataHora, status |

---

## 🔄 Fluxo de Login Completo

### 📋 Visão Geral

```
┌──────────────┐
│ 1. Usuário   │
│ digita email │
│ e senha      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ 2. Frontend envia    │
│ POST /auth/login     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 3. Backend recebe    │
│ e roteia             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 4. Controller valida │
│ email no banco       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 5. Compara senha     │
│ com bcrypt           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Gera token JWT    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 7. Retorna token     │
│ para frontend        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 8. Frontend salva    │
│ no localStorage      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 9. Redireciona para  │
│ dashboard            │
└──────────────────────┘
```

---

### 🔍 Passo a Passo Detalhado

#### **PASSO 1: Usuário Digita Email e Senha**

**📂 Arquivo:** `frontend/src/views/LoginView.vue`

**🔧 O que acontece:**

1. Usuário digita no formulário HTML
2. Valores ficam em variáveis reativas (`ref`)
3. Ao clicar em "Login", chama `fazerLogin()`

**💡 Conceitos:**

| Conceito          | Explicação                              |
| ----------------- | --------------------------------------- |
| `ref('')`         | Cria variável reativa que o Vue observa |
| `v-model`         | Liga input HTML ↔ variável JavaScript   |
| `@submit.prevent` | Envia form sem recarregar a página      |

---

#### **PASSO 2: Frontend Envia Dados**

**📂 Arquivo:** `frontend/src/views/LoginView.vue` → função `fazerLogin()`

**🔧 O que acontece:**

```javascript
// 1. Cria objeto com dados
const dados = { email: email.value, senha: senha.value };

// 2. Envia via axios
const resposta = await axios.post("http://localhost:3000/auth/login", dados);

// 3. Axios transforma em JSON e envia via HTTP
```

**💡 Conceitos:**

| Conceito       | Explicação                               |
| -------------- | ---------------------------------------- |
| `axios.post()` | Faz requisição HTTP POST                 |
| POST           | Método HTTP para enviar dados            |
| JSON           | Formato de texto para objetos JavaScript |

---

#### **PASSO 3: Backend Recebe**

**📂 Arquivo:** `backend/src/server.ts`

**🔧 O que acontece:**

1. Express escuta na porta 3000
2. Requisição chega em `/auth/login`
3. Express procura: `app.use('/auth', authRoutes)`
4. Direciona para arquivo de rotas

**💡 Conceitos:**

| Conceito    | Explicação                              |
| ----------- | --------------------------------------- |
| `app.use()` | Registra middleware ou rotas            |
| Middleware  | Intercepta requisições antes do destino |
| Roteamento  | Decide qual código executar pela URL    |

---

#### **PASSO 4: Rota Direciona para Controller**

**📂 Arquivo:** `backend/src/routes/auth.routes.ts`

**🔧 O que acontece:**

```javascript
// Express procura a rota
router.post("/login", login);
//            ↑        ↑
//          caminho  função do controller
```

**💡 Conceitos:**

| Conceito        | Explicação                    |
| --------------- | ----------------------------- |
| `router.post()` | Define rota POST              |
| Controller      | Arquivo com lógica de negócio |

---

#### **PASSO 5: Controller Valida Dados**

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `login()`

**🔧 O que acontece:**

```javascript
// 1. Extrai dados
const { email, senha } = req.body;

// 2. Busca no banco
const usuario = await Usuario.findOne({ email }).select("+senha");

// 3. Se não encontrar → erro 401
if (!usuario) {
  return res.status(401).json({ erro: "Credenciais inválidas" });
}
```

**💡 Conceitos:**

| Conceito            | Explicação                                    |
| ------------------- | --------------------------------------------- |
| `req.body`          | Dados enviados pelo cliente                   |
| `Usuario.findOne()` | Busca UM documento no MongoDB                 |
| `.select('+senha')` | Força incluir campo senha (oculto por padrão) |

---

#### **PASSO 6: Verifica Senha**

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `login()`

**🔧 O que acontece:**

```javascript
// Compara senha digitada com hash do banco
const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

if (!senhaCorreta) {
  return res.status(401).json({ erro: "Credenciais inválidas" });
}
```

**💡 Conceitos:**

| Conceito | Explicação                                               |
| -------- | -------------------------------------------------------- |
| Hash     | Transformação irreversível: "senha123" → "$2b$10$abc..." |
| Bcrypt   | Biblioteca para hash seguro de senhas                    |
| Por quê? | Nunca guardar senhas em texto puro                       |

**🔐 Como funciona o bcrypt:**

```
Senha digitada: "senha123"
        ↓
Bcrypt aplica mesmo processo de hash
        ↓
Compara com hash do banco
        ↓
Se bater → senha correta ✅
Se não bater → senha errada ❌
```

---

#### **PASSO 7: Gera Token JWT**

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `login()`

**🔧 O que acontece:**

```javascript
const token = jwt.sign(
  { id: usuario._id, role: usuario.role, nome: usuario.nome },
  process.env.JWT_SECRET,
  { expiresIn: "1d" },
);
```

**💡 Conceitos:**

| Conceito  | Explicação                          |
| --------- | ----------------------------------- |
| JWT       | JSON Web Token - "crachá digital"   |
| Estrutura | `header.payload.signature`          |
| Payload   | Dados do usuário (id, role, nome)   |
| Signature | Garante que ninguém alterou o token |
| Por quê?  | Backend não precisa guardar sessões |

**🔐 Estrutura do JWT:**

```
header.payload.signature
  ↓      ↓        ↓
tipo  dados   assinatura
```

---

#### **PASSO 8: Backend Retorna Token**

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `login()`

**🔧 O que acontece:**

```javascript
return res.status(200).json({
  token,
  usuario: { id, nome, email, role },
});
```

**💡 Conceitos:**

| Conceito          | Explicação                        |
| ----------------- | --------------------------------- |
| `res.status(200)` | Código HTTP 200 = sucesso         |
| `res.json()`      | Transforma objeto em JSON e envia |

---

#### **PASSO 9: Frontend Salva Token**

**📂 Arquivo:** `frontend/src/views/LoginView.vue` → função `fazerLogin()`

**🔧 O que acontece:**

```javascript
// 1. Recebe resposta
const { data } = await axios.post(...)

// 2. Salva token
localStorage.setItem('token', data.token)

// 3. Salva dados do usuário
localStorage.setItem('usuario', JSON.stringify(data.usuario))

// 4. Redireciona
router.push('/dashboard')
```

**💡 Conceitos:**

| Conceito           | Explicação                            |
| ------------------ | ------------------------------------- |
| `localStorage`     | Armazenamento do navegador (persiste) |
| `JSON.stringify()` | Transforma objeto em texto            |
| `router.push()`    | Navega sem recarregar página          |

---

#### **PASSO 10: Requisições Futuras**

**📂 Arquivo:** `frontend/src/services/api.ts`

**🔧 O que acontece:**

```javascript
// Interceptor adiciona token em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**💡 Conceitos:**

| Conceito    | Explicação                             |
| ----------- | -------------------------------------- |
| Interceptor | Intercepta requisições antes de enviar |
| Header      | Metadados da requisição HTTP           |
| Bearer      | Padrão de autenticação com token       |

---

## 🔐 Sistema de Autenticação

### 🤔 Autenticação vs Autorização

| Tipo             | Pergunta                 | Middleware        | Função                     |
| ---------------- | ------------------------ | ----------------- | -------------------------- |
| **Autenticação** | "Quem é você?"           | `autenticarToken` | Verifica se token é válido |
| **Autorização**  | "O que você pode fazer?" | `verificarAdmin`  | Verifica permissões (role) |

---

### 🛡️ Middleware: autenticarToken

**📂 Arquivo:** `backend/src/middlewares/auth.middleware.ts`

**🔧 Fluxo:**

```
1. Requisição chega com header: Authorization: Bearer abc123...
        ↓
2. Extrai token: authHeader.split(' ')[1]
        ↓
3. Verifica se existe → se não, retorna 401
        ↓
4. Decodifica: jwt.verify(token, JWT_SECRET)
        ↓
5. Se válido → coloca dados em req.usuario e chama next()
        ↓
6. Se inválido → retorna 403
```

**💡 Conceitos:**

| Conceito      | Explicação                               |
| ------------- | ---------------------------------------- |
| `next()`      | Passa requisição para próximo middleware |
| `req.usuario` | Injeta dados na requisição               |
| 401           | Unauthorized - não está logado           |
| 403           | Forbidden - logado mas sem permissão     |

---

### 🛡️ Middleware: verificarAdmin

**📂 Arquivo:** `backend/src/middlewares/auth.middleware.ts`

**🔧 Fluxo:**

```
1. autenticarToken já rodou
        ↓
2. req.usuario já tem dados do token
        ↓
3. Verifica: req.usuario.role !== 'ADMIN'
        ↓
4. Se não for admin → retorna 403
        ↓
5. Se for admin → chama next()
```

**❓ Por que dois middlewares separados?**

- ✅ **Reutilização:** `autenticarToken` serve para qualquer usuário logado
- ✅ **Flexibilidade:** Pode criar `verificarSecretario`, `verificarPaciente`, etc
- ✅ **Clareza:** Cada middleware tem uma responsabilidade única

---

## 🔑 Sistema de Recuperação de Senha

> **⚠️ IMPORTANTE:** Este é um dos sistemas mais críticos em termos de segurança!

---

### 📊 Fluxo Visual Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO ESQUECEU A SENHA                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  ForgotPasswordView.vue                                      │
│    → Usuário digita email                                       │
│    → Valida formato                                             │
│    → POST /auth/forgot-password                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  api.ts (Interceptor)                                        │
│    → Adiciona header Authorization (se tiver token)             │
│    → Envia requisição HTTP                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  auth.routes.ts                                              │
│    → Roteia para controller                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  auth.controller.ts - solicitarRecuperacao()                 │
│    → Valida email                                               │
│    → Busca usuário no banco                                     │
│    → Gera token aleatório (crypto.randomBytes)                  │
│    → Cria hash SHA-256 do token                                 │
│    → Salva HASH no banco (não o token original!)                │
│    → Chama enviarEmailRecuperacao()                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5️⃣  email.service.ts                                            │
│    → Monta link com token ORIGINAL                              │
│    → Envia email via Nodemailer                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO RECEBE EMAIL                         │
│                    Clica no link                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6️⃣  ResetPasswordView.vue                                       │
│    → Extrai token da URL (route.query.token)                    │
│    → Usuário digita nova senha                                  │
│    → Calcula força da senha                                     │
│    → POST /auth/reset-password                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7️⃣  auth.controller.ts - resetarSenha()                         │
│    → Valida token e senha                                       │
│    → Cria hash SHA-256 do token recebido                        │
│    → Busca usuário com hash + verifica expiração                │
│    → Gera hash bcrypt da nova senha                             │
│    → Atualiza senha no banco                                    │
│    → Remove token (invalida para não reutilizar)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ✅ SENHA REDEFINIDA COM SUCESSO!                 │
│                 Redireciona para login em 3s                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 📝 PARTE 1: Solicitação de Recuperação (Frontend)

**📂 Arquivo:** `frontend/src/views/ForgotPasswordView.vue`

**🔗 Conexões:**

```javascript
import api from "../services/api.ts"; // → Requisições HTTP
import { useRouter } from "vue-router"; // → Navegação
import { ref } from "vue"; // → Variáveis reativas
```

---

#### **🔧 Fluxo Detalhado:**

**1️⃣ Usuário digita o email**

```javascript
// Input HTML ligado com v-model
<input v-model="email" />

// Quando usuário digita, email.value atualiza automaticamente
// Isso é REATIVIDADE do Vue: HTML ↔ JavaScript sincronizados
```

**2️⃣ Usuário clica em "Enviar"**

```javascript
<form @submit.prevent="solicitarRecuperacao">
//      ↑
//      .prevent → Impede reload da página
```

**3️⃣ Função solicitarRecuperacao executa**

```javascript
// 🧹 Limpa mensagens anteriores
mensagem.value = "";
mensagemErro.value = "";

// ✅ Valida se email não está vazio
if (!email.value.trim()) {
  mensagemErro.value = "Digite seu email";
  return; // Para execução aqui
}

// ✅ Valida formato do email (regex)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email.value)) {
  mensagemErro.value = "Email inválido";
  return;
}

// ⏳ Ativa estado de carregamento
carregando.value = true; // Desabilita botão
```

**📖 Explicação do Regex:**

```
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
 │   │    │   │   │    │
 │   │    │   │   │    └─ Termina com caracteres (não espaço/não @)
 │   │    │   │   └────── Tem um ponto literal
 │   │    │   └────────── Depois do @ tem caracteres
 │   │    └────────────── Tem um @
 │   └─────────────────── Começa com caracteres (não espaço/não @)
 └─────────────────────── Início da string
```

**4️⃣ Envia requisição para backend**

```javascript
try {
  const resposta = await api.post(
    "/auth/forgot-password",
    { email: email.value }, // ← Corpo da requisição
    { skipAuthRedirect: true }, // ← Configuração especial
  );

  mensagem.value = resposta.data.mensagem;
} catch (error) {
  mensagemErro.value = error.response?.data?.erro || "Erro ao enviar email";
} finally {
  carregando.value = false; // SEMPRE executa
}
```

**❓ Por que skipAuthRedirect: true?**

| Sem skipAuthRedirect                         | Com skipAuthRedirect       |
| -------------------------------------------- | -------------------------- |
| Se der erro 401/403, redireciona para /login | Não redireciona            |
| ❌ Ruim para rotas públicas                  | ✅ Bom para rotas públicas |

**💡 Por que usar try/catch/finally?**

```
try     → Tenta executar o código
catch   → Se der erro, captura e trata
finally → SEMPRE executa (sucesso ou erro)
```

---

### 📝 PARTE 2: Requisição HTTP (api.ts)

**📂 Arquivo:** `frontend/src/services/api.ts`

**🔗 Conexões:**

```javascript
import axios from "axios"; // → Requisições HTTP
import router from "../router"; // → Redirecionamento
```

---

#### **🔧 O que acontece quando você chama api.post():**

**1️⃣ Interceptor de REQUISIÇÃO (ANTES de enviar)**

```javascript
api.interceptors.request.use((config) => {
  // 🔍 Pega token do localStorage
  const token = localStorage.getItem("token");

  // ➕ Adiciona header Authorization
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config; // Retorna config modificado
});
```

**📊 Resultado:**

```
Requisição sai com:
├── URL: http://localhost:3000/auth/forgot-password
├── Method: POST
├── Headers:
│   ├── Authorization: Bearer <token>
│   └── Content-Type: application/json
└── Body: { "email": "usuario@email.com" }
```

**2️⃣ Axios envia a requisição**

```
Frontend (5173) ──────HTTP POST──────> Backend (3000)
```

**3️⃣ Interceptor de RESPOSTA (quando volta)**

```javascript
api.interceptors.response.use(
  (response) => {
    // ✅ Sucesso (200-299) → deixa passar
    return response;
  },
  (error) => {
    // ❌ Erro 401 ou 403
    if (error.response && [401, 403].includes(error.response.status)) {
      // 🔍 Verifica se NÃO deve redirecionar
      if (!error.config.skipAuthRedirect) {
        localStorage.removeItem("token"); // Remove token inválido
        router.push("/login"); // Redireciona
      }
    }

    return Promise.reject(error); // Vai para o catch
  },
);
```

---

### 📝 PARTE 3: Backend Recebe e Valida

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `solicitarRecuperacao()`

**🔗 Conexões:**

```javascript
import Usuario from "../models/Usuario"; // → Banco de dados
import validator from "validator"; // → Validação de email
import crypto from "crypto"; // → Gerar token seguro
import { enviarEmailRecuperacao } from "../services/email.service"; // → Enviar email
```

---

#### **🔧 Fluxo Detalhado:**

**1️⃣ Extrai email do body**

```javascript
const { email } = req.body;
// Destructuring: pega propriedade 'email' do objeto req.body
```

**2️⃣ Valida se email não está vazio**

```javascript
if (!email) {
  return res.status(400).json({ erro: "Email é obrigatório" });
}
// Status 400 = Bad Request (erro do cliente)
```

**3️⃣ Valida formato do email**

```javascript
if (!validator.isEmail(email)) {
  return res.status(400).json({ erro: "Formato de email inválido" });
}
// validator.isEmail() → Mais robusto que regex simples
```

**4️⃣ Busca usuário no banco**

```javascript
const usuario = await Usuario.findOne({ email });
// findOne({ email }) → Busca UM documento onde campo email = valor
// await → Espera promise resolver (operação assíncrona)
```

**5️⃣ IMPORTANTE - Segurança**

```javascript
if (!usuario) {
  // ⚠️ Mesmo se NÃO encontrar, retorna mensagem GENÉRICA
  return res.status(200).json({
    mensagem: "Se o email existir, enviaremos um link de recuperação",
  });
}
```

**❓ Por que mensagem genérica?**

| Com mensagem específica           | Com mensagem genérica   |
| --------------------------------- | ----------------------- |
| "Email não encontrado"            | "Se o email existir..." |
| ❌ Revela se email existe         | ✅ Não revela nada      |
| ❌ Atacante pode descobrir emails | ✅ Seguro               |

**6️⃣ Gera token aleatório**

```javascript
const token = crypto.randomBytes(32).toString("hex");
// crypto.randomBytes(32) → Gera 32 bytes aleatórios (256 bits)
// .toString('hex')       → Converte para hexadecimal (64 caracteres)
```

**📊 Exemplo de token gerado:**

```
a3f5c8d2e1b4f7a9c6d8e2f1b5a7c9d3e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7
```

**❓ Por que crypto.randomBytes e não Math.random()?**

| Math.random()    | crypto.randomBytes()      |
| ---------------- | ------------------------- |
| Pseudo-aleatório | Criptograficamente seguro |
| Previsível       | Imprevisível              |
| ❌ NÃO é seguro  | ✅ Seguro                 |

**7️⃣ Cria hash SHA-256 do token**

```javascript
const tokenHash = crypto
  .createHash("sha256") // Cria objeto hash SHA-256
  .update(token) // Adiciona token para ser hasheado
  .digest("hex"); // Finaliza e retorna hash em hex
```

**🔐 Algoritmo SHA-256:**

```
SHA = Secure Hash Algorithm
256 = Produz hash de 256 bits (64 caracteres hex)

É uma função de mão única:
token → hash (fácil) ✅
hash → token (impossível) ❌
```

**❓ Por que hashear o token antes de salvar?**

```
┌─────────────────────────────────────────────────────────┐
│ Se alguém invadir o banco de dados:                     │
├─────────────────────────────────────────────────────────┤
│ ❌ Token em texto plano → Atacante pode usar            │
│ ✅ Token hasheado → Atacante NÃO consegue usar          │
└─────────────────────────────────────────────────────────┘
```

**8️⃣ Salva hash no banco**

```javascript
usuario.resetPasswordToken = tokenHash; // ← Salva o HASH, não o token
usuario.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
await usuario.save();
```

**📊 Cálculo da expiração:**

```
Date.now()     → Timestamp atual em milissegundos
+ 3600000      → Adiciona 1 hora (3600 segundos × 1000 ms)
= Expira em 1h
```

**9️⃣ Envia email com token ORIGINAL**

```javascript
await enviarEmailRecuperacao(usuario.email, token);
// Passa o token ORIGINAL, não o hash
```

**❓ Por que enviar token original e não o hash?**

```
Usuário precisa do token ORIGINAL para acessar o link
Backend vai hashear o token recebido e comparar com o hash do banco
```

**🔟 Retorna resposta genérica**

```javascript
return res.status(200).json({
  mensagem: "Se o email existir, você receberá um link de recuperação",
});
// Sempre a mesma mensagem (segurança)
```

---

### 📝 PARTE 4: Envio de Email

**📂 Arquivo:** `backend/src/services/email.service.ts`

**🔗 Conexões:**

```javascript
import nodemailer from "nodemailer"; // → Enviar emails
// Usa process.env para configurações do .env
```

---

#### **🔧 Configuração do Transporter:**

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT), // 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER, // seu-email@gmail.com
    pass: process.env.EMAIL_PASS, // senha de app
  },
});
```

**❓ Por que senha de app e não senha normal?**

```
┌─────────────────────────────────────────────────────────┐
│ Google não permite apps usarem senha normal             │
├─────────────────────────────────────────────────────────┤
│ Senha de app:                                           │
│ • Gerada nas configurações do Gmail                     │
│ • Tem 16 caracteres: xxxx xxxx xxxx xxxx                │
│ • Mais segura que senha normal                          │
└─────────────────────────────────────────────────────────┘
```

---

#### **🔧 Função enviarEmailRecuperacao:**

**1️⃣ Monta o link de recuperação**

```javascript
const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
// Exemplo: http://localhost:5173/reset-password?token=a3f5c8d2...
```

**📊 Estrutura da URL:**

```
http://localhost:5173/reset-password?token=a3f5c8d2e1b4f7a9
│                     │                │
│                     │                └─ Query parameter (token)
│                     └────────────────── Rota
└──────────────────────────────────────── Base URL
```

**2️⃣ Envia o email**

```javascript
const info = await transporter.sendMail({
  from: process.env.EMAIL_FROM, // "MedConnect" <email@gmail.com>
  to: email, // Email do usuário
  subject: "Recuperação de Senha - MedConnect",
  text: "...", // Versão texto puro
  html: "...", // Versão HTML
});
```

**❓ Por que duas versões (text e html)?**

```
Alguns clientes de email não suportam HTML
Sempre forneça fallback em texto puro
```

**3️⃣ Trata erros**

```javascript
try {
  // ... código de envio
  return true;
} catch (erro) {
  console.error("Erro ao enviar email:", erro);
  throw new Error("Falha ao enviar email de recuperação");
}
// Se der erro, lança exceção capturada no controller
```

---

### 📝 PARTE 5: Usuário Clica no Link

**📂 Arquivo:** `frontend/src/views/ResetPasswordView.vue`

**🔗 Conexões:**

```javascript
import { useRoute, useRouter } from "vue-router"; // → Rotas
import api from "../services/api"; // → Requisições
import { ref, onMounted } from "vue"; // → Reatividade
```

---

#### **🔧 Quando o componente carrega:**

```javascript
onMounted(() => {
  // Extrai token da URL
  token.value = String(route.query.token || "");

  if (!token.value) {
    console.log("Erro: Token inválido");
  }
});
```

**📊 Exemplo de URL:**

```
http://localhost:5173/reset-password?token=a3f5c8d2e1b4f7a9
                                      ↑
                                      route.query.token
```

---

#### **🔧 Cálculo de força da senha:**

```javascript
const calcularForcaSenha = () => {
  const tamanho = novaSenha.value.length;

  // Testa padrões com regex
  const temLetras = /[a-zA-Z]/.test(novaSenha.value);
  const temNumeros = /[0-9]/.test(novaSenha.value);
  const temEspeciais = /[!@#$%^&*]/.test(novaSenha.value);

  // Classifica
  if (tamanho < 6) {
    forcaSenha.value = "Fraca";
  } else if (tamanho >= 8 && temLetras && temNumeros && temEspeciais) {
    forcaSenha.value = "Forte";
  } else {
    forcaSenha.value = "Média";
  }
};
```

**📊 Tabela de Classificação:**

| Condição                                     | Resultado |
| -------------------------------------------- | --------- |
| Menos de 6 caracteres                        | 🔴 Fraca  |
| 8+ caracteres + letras + números + especiais | 🟢 Forte  |
| Outros casos                                 | 🟡 Média  |

---

#### **🔧 Função resetarSenha:**

**1️⃣ Validações**

```javascript
if (!token.value) {
  console.log("Token não encontrado");
  return;
}

if (!novaSenha.value) {
  mensagemErro.value = "Digite uma nova senha";
  return;
}

if (novaSenha.value.length < 6) {
  mensagemErro.value = "Senha deve ter no mínimo 6 caracteres";
  return;
}

if (confirmarSenha.value !== novaSenha.value) {
  mensagemErro.value = "As senhas não coincidem";
  return;
}
```

**2️⃣ Envia requisição**

```javascript
const resposta = await api.post(
  "/auth/reset-password",
  {
    token: token.value,
    novaSenha: novaSenha.value,
  },
  {
    skipAuthRedirect: true, // Não redirecionar se der 401
  },
);
```

**3️⃣ Contagem regressiva**

```javascript
mensagem.value = resposta.data.mensagem;
contadorRedirect.value = 3;

// setInterval → Executa função a cada X milissegundos
const intervalo = setInterval(() => {
  contadorRedirect.value--; // 3 → 2 → 1 → 0

  if (contadorRedirect.value === 0) {
    clearInterval(intervalo); // Para o intervalo
    router.push("/login"); // Redireciona
  }
}, 1000); // 1000ms = 1 segundo
```

**❓ Por que clearInterval?**

```
Se não parar, o intervalo continua executando para sempre
Causaria vazamento de memória
```

---

### 📝 PARTE 6: Backend Valida e Atualiza Senha

**📂 Arquivo:** `backend/src/controllers/auth.controller.ts` → função `resetarSenha()`

---

#### **🔧 Fluxo Detalhado:**

**1️⃣ Extrai dados**

```javascript
const { token, novaSenha } = req.body;
// token     → Veio da URL que o usuário clicou
// novaSenha → Veio do formulário
```

**2️⃣ Validações básicas**

```javascript
if (!token) {
  return res.status(400).json({ erro: "Token é obrigatório" });
}

if (!novaSenha) {
  return res.status(400).json({ erro: "A nova senha é obrigatória" });
}

if (novaSenha.length < 6) {
  return res.status(400).json({
    erro: "A senha precisa ter no mínimo 6 caracteres",
  });
}
```

**3️⃣ ALGORITMO DE VALIDAÇÃO DO TOKEN**

```javascript
// Cria hash SHA-256 do token recebido
const tokenHash = crypto
  .createHash("sha256")
  .update(token) // ← Token ORIGINAL que veio da URL
  .digest("hex");
```

**❓ Por quê?**

```
No banco está salvo o HASH, não o token original
Precisamos hashear o token recebido para comparar
```

**4️⃣ Busca usuário com token válido**

```javascript
const usuario = await Usuario.findOne({
  resetPasswordToken: tokenHash, // Token deve bater
  resetPasswordExpires: { $gt: Date.now() }, // Expiração > agora
});
// $gt → Operador MongoDB: Greater Than (maior que)
```

**📊 Possíveis motivos para não encontrar:**

```
❌ Token não existe no banco (nunca foi gerado)
❌ Token já foi usado e removido
❌ Token expirou (passou de 1 hora)
❌ Token está errado (foi modificado)
```

**5️⃣ Se não encontrar**

```javascript
if (!usuario) {
  return res.status(400).json({
    erro: "Token inválido ou expirado",
  });
}
```

**6️⃣ Gera hash bcrypt da nova senha**

```javascript
const salt = await bcrypt.genSalt(10);
// Gera "sal" com 10 rounds

const senhaHash = await bcrypt.hash(novaSenha, salt);
// Cria hash bcrypt da senha
// Exemplo: "$2b$10$abc123..." (60 caracteres)
```

**❓ Por que bcrypt e não SHA-256?**

| SHA-256                        | Bcrypt                |
| ------------------------------ | --------------------- |
| Rápido demais                  | Propositalmente LENTO |
| Atacante testa milhões/segundo | Dificulta força bruta |
| Sem sal                        | Sal embutido          |
| ❌ Para senhas                 | ✅ Para senhas        |

**7️⃣ Atualiza senha e remove token**

```javascript
usuario.senha = senhaHash;
usuario.resetPasswordToken = undefined; // Remove token
usuario.resetPasswordExpires = undefined; // Remove expiração
await usuario.save();
```

**❓ Por que remover o token?**

```
Invalida o token para não ser reutilizado
Se alguém interceptar o email, não pode usar o link novamente
```

**8️⃣ Retorna sucesso**

```javascript
return res.status(200).json({
  mensagem: "Senha redefinida com sucesso!",
});
```

---

### 🔐 Diagrama de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│ TOKEN ORIGINAL (enviado por email)                          │
│ "a3f5c8d2e1b4f7a9c6d8e2f1b5a7c9d3"                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ SHA-256
┌─────────────────────────────────────────────────────────────┐
│ HASH SHA-256 (salvo no banco)                               │
│ "7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4..."  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuário clica no link com TOKEN ORIGINAL                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend recebe TOKEN ORIGINAL                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ SHA-256
┌─────────────────────────────────────────────────────────────┐
│ Cria HASH SHA-256 do token recebido                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Compara com HASH no banco                                   │
├─────────────────────────────────────────────────────────────┤
│ Se bater     → ✅ Token válido                               │
│ Se não bater → ❌ Token inválido                             │
└─────────────────────────────────────────────────────────────┘
```

---

### ✅ Checklist de Segurança Implementado

| Item                 | Status | Descrição                           |
| -------------------- | ------ | ----------------------------------- |
| Mensagem genérica    | ✅     | Não revela se email existe          |
| Token aleatório      | ✅     | Usa crypto.randomBytes (seguro)     |
| Hash SHA-256         | ✅     | Token não é salvo em texto plano    |
| Expiração            | ✅     | Token expira em 1 hora              |
| Uso único            | ✅     | Token é removido após uso           |
| Senha hasheada       | ✅     | Nova senha é hasheada com bcrypt    |
| Validação de formato | ✅     | Email é validado antes de processar |
| HTTPS recomendado    | ⚠️     | Em produção, usar HTTPS             |

---

### 🚀 Possíveis Melhorias Futuras

1. **Rate limiting:** Limitar tentativas de recuperação por IP
2. **Log de auditoria:** Registrar todas as tentativas
3. **Notificação:** Enviar email quando senha for alterada
4. **2FA:** Adicionar segundo fator de autenticação
5. **Blacklist de senhas:** Impedir senhas comuns (123456, password, etc)

---

## 📊 Sistema de Agendamentos

### 📋 Listagem de Agendamentos

**📂 Arquivo:** `backend/src/controllers/agendamento.controller.ts` → função `listarAgendamentos()`

---

#### **🔧 Fluxo:**

```
1. Pega id e role de req.usuario (colocado pelo middleware)
        ↓
2. Cria query vazia: let query = {}
        ↓
3. Se for PACIENTE → query = { pacienteId: usuarioId }
   Se for ADMIN/SECRETARIO → query = {} (busca tudo)
        ↓
4. Executa: Agendamento.find(query)
        ↓
5. Ordena por data: .sort({ dataHora: -1 })
        ↓
6. Popula nome do paciente: .populate('pacienteId', 'nome')
        ↓
7. Retorna lista de agendamentos
```

---

#### **💡 Conceitos:**

| Conceito               | Explicação                                   | Exemplo                          |
| ---------------------- | -------------------------------------------- | -------------------------------- |
| Query vazia `{}`       | No MongoDB, significa "busca tudo"           | `find({})`                       |
| Query com filtro       | Busca apenas documentos que atendem condição | `find({ status: 'CONFIRMADO' })` |
| `.sort({ campo: -1 })` | Ordena decrescente (-1) ou crescente (1)     | `.sort({ dataHora: -1 })`        |
| `.populate()`          | Substitui ID por dados completos             | Ver exemplo abaixo ⬇️            |

---

#### **📊 Exemplo de .populate():**

**Sem populate:**

```json
{
  "_id": "123",
  "pacienteId": "abc",
  "dataHora": "2026-04-05T10:00:00Z"
}
```

**Com populate:**

```json
{
  "_id": "123",
  "pacienteId": {
    "_id": "abc",
    "nome": "João Silva"
  },
  "dataHora": "2026-04-05T10:00:00Z"
}
```

---

### 📝 Criação de Agendamento

**📂 Arquivo:** `backend/src/services/agendamento.service.ts` → função `realizarAgendamento()`

---

#### **🔧 Fluxo:**

```
1. Valida se a data é válida
        ↓
2. Valida se não é no passado
        ↓
3. Valida limite de 90 dias
        ↓
4. Verifica conflito (horário já ocupado)
        ↓
5. Busca dados do paciente
        ↓
6. Busca previsão do tempo
        ↓
7. Cria o agendamento
        ↓
8. Retorna agendamento criado
```

---

#### **❓ Por que está em service e não em controller?**

| Controller                        | Service                |
| --------------------------------- | ---------------------- |
| Lida com requisição/resposta HTTP | Lógica de negócio pura |
| Específico para rotas             | Pode ser reutilizado   |
| Exemplo: `req`, `res`             | Exemplo: funções puras |

**📊 Separação de Responsabilidades:**

```
Controller → Recebe requisição HTTP
     ↓
Service → Executa lógica de negócio
     ↓
Model → Acessa banco de dados
```

---

### 🕐 Cálculo de Horários Livres

**📂 Arquivo:** `backend/src/services/agendamento.service.ts` → função `calcularHorariosLivres()`

---

#### **🔧 Fluxo:**

```
1. Define início e fim do dia em UTC
        ↓
2. Cria array de horários base
   (9h às 17h30, intervalos de 30min, exceto 12h-13h)
        ↓
3. Busca agendamentos ocupados naquele dia
        ↓
4. Formata horários ocupados para formato brasileiro
        ↓
5. Filtra array base removendo os ocupados
        ↓
6. Retorna apenas os livres
```

---

#### **💡 Conceitos:**

| Conceito              | Explicação                                   |
| --------------------- | -------------------------------------------- |
| UTC                   | Fuso horário universal (0). Brasil é UTC-3   |
| `Intl.DateTimeFormat` | API JavaScript para formatar datas           |
| `.filter()`           | Retorna apenas elementos que passam no teste |

---

## 🗄️ Banco de Dados (MongoDB + Mongoose)

### 🤔 O que é MongoDB?

MongoDB é um banco de dados **NoSQL** (não relacional):

| Característica | Descrição                            |
| -------------- | ------------------------------------ |
| 📄 Formato     | Guarda dados em JSON (documentos)    |
| 📦 Collections | Equivalente a "tabelas"              |
| 🔓 Schema-less | Não precisa definir estrutura rígida |
| 🚀 Performance | Rápido para leitura/escrita          |

---

### 🤔 O que é Mongoose?

Mongoose é uma biblioteca que:

```
┌─────────────────────────────────────────────────────────┐
│ Node.js                                                 │
│    ↕️ Mongoose (ponte)                                   │
│ MongoDB                                                 │
└─────────────────────────────────────────────────────────┘
```

**🔧 Funções:**

- ✅ Conecta Node.js com MongoDB
- ✅ Define schemas (estrutura dos dados)
- ✅ Valida dados antes de salvar
- ✅ Fornece métodos para CRUD

---

### 📊 Como funciona um Model

**📂 Arquivo:** `backend/src/models/Usuario.ts`

---

#### **🔧 Estrutura:**

```javascript
// 1️⃣ Define interface TypeScript (tipos para o código)
interface IUsuario {
  nome: string
  email: string
  senha: string
  role: 'PACIENTE' | 'ADMIN'
}

// 2️⃣ Define Schema Mongoose (validação para o banco)
const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true, select: false },
  role: { type: String, enum: ['PACIENTE', 'ADMIN'], default: 'PACIENTE' }
})

// 3️⃣ Exporta o model
export default mongoose.model('Usuario', UsuarioSchema)
```

---

#### **💡 O que o Schema faz:**

| Propriedade | Função                  | Exemplo               |
| ----------- | ----------------------- | --------------------- |
| `type`      | Define tipo do campo    | `type: String`        |
| `required`  | Campo obrigatório       | `required: true`      |
| `unique`    | Não pode ter duplicados | `unique: true`        |
| `default`   | Valor padrão            | `default: 'PACIENTE'` |
| `enum`      | Só aceita esses valores | `enum: ['A', 'B']`    |
| `minlength` | Tamanho mínimo          | `minlength: 6`        |
| `match`     | Valida com regex        | `match: /regex/`      |
| `select`    | Retorna por padrão?     | `select: false`       |

---

### 🔧 Métodos Principais do Mongoose

#### **🔍 Buscar:**

| Método                 | Retorno                | Uso             |
| ---------------------- | ---------------------- | --------------- |
| `Model.find(query)`    | Array (pode ser vazio) | Buscar vários   |
| `Model.findOne(query)` | Documento ou null      | Buscar um       |
| `Model.findById(id)`   | Documento ou null      | Buscar por \_id |

**📊 Exemplos:**

```javascript
// Buscar todos os pacientes
const pacientes = await Usuario.find({ role: "PACIENTE" });

// Buscar um usuário por email
const usuario = await Usuario.findOne({ email: "joao@email.com" });

// Buscar por ID
const usuario = await Usuario.findById("507f1f77bcf86cd799439011");
```

---

#### **➕ Criar:**

| Método                | Função                |
| --------------------- | --------------------- |
| `Model.create(dados)` | Cria e salva no banco |

**📊 Exemplo:**

```javascript
const usuario = await Usuario.create({
  nome: "João Silva",
  email: "joao@email.com",
  senha: "senhaHasheada",
  role: "PACIENTE",
});
```

---

#### **✏️ Atualizar:**

| Método                                        | Função                  |
| --------------------------------------------- | ----------------------- |
| `Model.findByIdAndUpdate(id, dados, options)` | Busca por id e atualiza |

**📊 Options importantes:**

| Option                    | Função                                      |
| ------------------------- | ------------------------------------------- |
| `{ new: true }`           | Retorna documento atualizado (não o antigo) |
| `{ runValidators: true }` | Valida dados antes de atualizar             |

**📊 Exemplo:**

```javascript
const usuario = await Usuario.findByIdAndUpdate(
  "507f1f77bcf86cd799439011",
  { nome: "João Pedro Silva" },
  { new: true, runValidators: true },
);
```

---

#### **🗑️ Deletar:**

| Método                        | Função                |
| ----------------------------- | --------------------- |
| `Model.findByIdAndDelete(id)` | Busca por id e deleta |

**📊 Exemplo:**

```javascript
await Usuario.findByIdAndDelete("507f1f77bcf86cd799439011");
```

---

## 🎨 Frontend (Vue.js)

### ⚡ Reatividade no Vue

**💡 Conceito central:** Quando uma variável muda, a tela atualiza automaticamente.

---

#### **🔧 Como funciona:**

```javascript
// Cria variável reativa
const nome = ref('João')

// No JavaScript: usa .value
console.log(nome.value)  // 'João'
nome.value = 'Maria'     // Atualiza

// No template HTML: sem .value
<p>{{ nome }}</p>  // <p>João</p>
```

**📊 Tabela de Uso:**

| Local         | Sintaxe          | Exemplo               |
| ------------- | ---------------- | --------------------- |
| JavaScript    | `variavel.value` | `nome.value = 'João'` |
| Template HTML | `{{ variavel }}` | `<p>{{ nome }}</p>`   |

---

### 🔄 Ciclo de Vida dos Componentes

**📊 Hooks principais:**

| Hook            | Quando executa             | Uso comum                           |
| --------------- | -------------------------- | ----------------------------------- |
| `onMounted()`   | Componente aparece na tela | Buscar dados da API                 |
| `onUnmounted()` | Componente sai da tela     | Limpar timers, cancelar requisições |

**📊 Exemplo:**

```javascript
onMounted(() => {
  // Executa quando componente carrega
  buscarDados();
});

onUnmounted(() => {
  // Executa quando componente é destruído
  clearInterval(intervalo);
});
```

---

### 🧮 Computed Properties

**📂 Arquivo:** `frontend/src/views/DashboardAdmin.vue`

**💡 O que é:**

- Variável que depende de outras variáveis
- Recalcula automaticamente quando dependências mudam
- É cacheada (não recalcula se dependências não mudaram)

---

#### **📊 Exemplo:**

```javascript
const agendamentos = ref([...])
const buscar = ref('')

// Computed property
const agendamentosFiltrados = computed(() => {
  return agendamentos.value.filter(a =>
    a.nome.includes(buscar.value)
  )
})
```

**🔄 Fluxo:**

```
buscar muda → agendamentosFiltrados recalcula automaticamente
agendamentos muda → agendamentosFiltrados recalcula automaticamente
```

---

### 🛣️ Vue Router

**📂 Arquivo:** `frontend/src/router/index.ts`

**💡 O que faz:**

- Mapeia URLs para componentes
- Gerencia navegação sem recarregar página (SPA)
- Protege rotas com guards

---

#### **🔧 Navigation Guard:**

```javascript
router.beforeEach((to, from, next) => {
  // to   → Para onde está indo
  // from → De onde está vindo
  // next → Função que libera ou redireciona

  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login"); // Redireciona
  } else {
    next(); // Libera
  }
});
```

**📊 Fluxo:**

```
1. Usuário clica em link ou digita URL
        ↓
2. Guard intercepta
        ↓
3. Verifica condições (está logado? é admin?)
        ↓
4. Chama next() para liberar
   ou next('/outra-rota') para redirecionar
```

---

## 🔧 Ferramentas e Conceitos

### 📡 Axios vs Fetch

| Característica      | Fetch     | Axios               |
| ------------------- | --------- | ------------------- |
| Nativo              | ✅ Sim    | ❌ Não (biblioteca) |
| Transforma JSON     | ❌ Manual | ✅ Automático       |
| Interceptors        | ❌ Não    | ✅ Sim              |
| Tratamento de erros | ❌ Básico | ✅ Melhor           |
| Timeout             | ❌ Manual | ✅ Automático       |

**🏆 Vantagens do Axios:**

```
✅ Transforma JSON automaticamente
✅ Suporta interceptors (modificar requisições globalmente)
✅ Melhor tratamento de erros
✅ Timeout automático
✅ Mais fácil de usar
```

---

### 💾 LocalStorage

**💡 O que é:** Armazenamento do navegador que persiste entre sessões.

---

#### **🔧 Métodos:**

| Método                  | Função     | Exemplo                                   |
| ----------------------- | ---------- | ----------------------------------------- |
| `setItem(chave, valor)` | Salva      | `localStorage.setItem('token', 'abc123')` |
| `getItem(chave)`        | Busca      | `localStorage.getItem('token')`           |
| `removeItem(chave)`     | Remove     | `localStorage.removeItem('token')`        |
| `clear()`               | Limpa tudo | `localStorage.clear()`                    |

---

#### **⚠️ Limitações:**

```
❌ Só guarda strings (use JSON.stringify/parse para objetos)
❌ Máximo ~5MB
❌ Não é seguro (JavaScript pode acessar)
❌ Nunca guarde senhas ou dados sensíveis
```

**📊 Exemplo com objetos:**

```javascript
// Salvar objeto
const usuario = { nome: "João", email: "joao@email.com" };
localStorage.setItem("usuario", JSON.stringify(usuario));

// Buscar objeto
const usuarioString = localStorage.getItem("usuario");
const usuario = JSON.parse(usuarioString);
```

---

### 🌍 Variáveis de Ambiente

**📂 Arquivo:** `backend/.env`

**💡 O que são:** Configurações que mudam entre ambientes (dev, produção).

---

#### **📊 Exemplos:**

```env
MONGO_URI=mongodb://localhost:27017/clinica
JWT_SECRET=chave-secreta-super-segura
WEATHER_API_KEY=abc123xyz789
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

#### **❓ Por que usar?**

| Motivo           | Explicação                                    |
| ---------------- | --------------------------------------------- |
| 🔐 Segurança     | Não commita senhas no Git                     |
| 🔄 Flexibilidade | Muda configuração sem mudar código            |
| 🌍 Ambientes     | Dev, staging, produção com configs diferentes |

---

#### **🔧 Como acessar:**

```javascript
// No Node.js
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
```

---

### 🌐 CORS (Cross-Origin Resource Sharing)

**📂 Arquivo:** `backend/src/server.ts`

**💡 O que é:** Política de segurança do navegador.

---

#### **❌ Problema:**

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
          ↑
São domínios diferentes!
Navegador bloqueia por padrão
```

---

#### **✅ Solução:**

```javascript
app.use(
  cors({
    origin: "http://localhost:5173", // Quem pode acessar
    methods: ["GET", "POST", "PUT", "DELETE"], // Quais métodos
    allowedHeaders: ["Content-Type", "Authorization"], // Quais headers
  }),
);
```

**📊 Fluxo:**

```
1. Frontend faz requisição para backend
        ↓
2. Navegador verifica CORS
        ↓
3. Backend autoriza explicitamente
        ↓
4. Requisição é permitida
```

---

## 🐛 Problemas Comuns

### ❌ Erro: "Cannot read property 'role' of undefined"

**🔍 Causa:** Tentando acessar `req.usuario.role` mas `req.usuario` não existe.

**📊 Possíveis motivos:**

```
1. Middleware autenticarToken não está na rota
2. Token não foi enviado no header
3. Token é inválido
```

**🔧 Como debugar:**

```javascript
// Adicione no início do controller
console.log("req.usuario:", req.usuario);

// Verifique se middleware está na rota
router.get("/rota", autenticarToken, controller);
//                   ↑ Deve estar aqui

// Verifique token no DevTools
// F12 → Network → Headers → Authorization
```

---

### ❌ Erro: "jwt malformed"

**🔍 Causa:** Token JWT está corrompido ou incompleto.

**📊 Possíveis motivos:**

```
1. Token não foi salvo corretamente no localStorage
2. Token foi modificado manualmente
3. Formato errado (falta "Bearer " no header)
```

**🔧 Como resolver:**

```javascript
// 1. Faça logout e login novamente
localStorage.clear();

// 2. Verifique o formato
// Correto: Bearer abc123...
// Errado: abc123...

// 3. Verifique no DevTools
console.log(localStorage.getItem("token"));
```

---

### ❌ Erro: "E11000 duplicate key error"

**🔍 Causa:** Tentando criar documento com valor único que já existe.

**📊 Exemplo:** Email já cadastrado.

**🔧 Como resolver:**

```javascript
// Verifique se email já existe ANTES de criar
const usuarioExistente = await Usuario.findOne({ email })

if (usuarioExistente) {
  return res.status(400).json({
    erro: 'Email já cadastrado'
  })
}

// Só cria se não existir
const usuario = await Usuario.create({ ... })
```

---

### ❌ Erro: "ValidationError: role: `ADMIN` is not a valid enum value"

**🔍 Causa:** Tentando salvar valor que não está no enum do schema.

**🔧 Como resolver:**

```javascript
// No model Usuario.ts
const UsuarioSchema = new Schema({
  role: {
    type: String,
    enum: ["PACIENTE", "ADMIN"], // ← Adicione 'ADMIN' aqui
    default: "PACIENTE",
  },
});

// Reinicie o servidor backend
```

---

## 🎓 Próximos Passos

### 📊 Seu Progresso

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Nível Iniciante                                       │
├─────────────────────────────────────────────────────────┤
│ ✅ Entender fluxo de autenticação                        │
│ ✅ Entender middlewares                                  │
│ ✅ Entender models e schemas                             │
│ ✅ Implementar recuperação de senha                      │
│ 🔄 Implementar sistema de roles                          │
│ ⏭️ Criar testes manuais (Postman)                        │
└─────────────────────────────────────────────────────────┘
```

---

### 📚 Nível Intermediário

```
1. Criar testes automatizados (Jest)
2. Adicionar validação com Joi ou Zod
3. Implementar refresh tokens
4. Adicionar paginação nas listagens
5. Criar logs de auditoria
```

---

### 🚀 Nível Avançado

```
1. Implementar rate limiting (limitar requisições)
2. Adicionar cache (Redis)
3. Criar sistema de permissões granulares
4. Implementar WebSockets para notificações em tempo real
5. Deploy em produção (Docker, AWS, etc)
```

---

## 📚 Recursos para Aprender

### 📖 Documentações Oficiais

| Tecnologia | Link                        |
| ---------- | --------------------------- |
| Express    | https://expressjs.com/      |
| Mongoose   | https://mongoosejs.com/     |
| Vue.js     | https://vuejs.org/          |
| JWT        | https://jwt.io/introduction |
| Nodemailer | https://nodemailer.com/     |

---

### 💡 Conceitos para Estudar

```
✅ REST API
✅ HTTP Status Codes
✅ Async/Await
✅ Promises
✅ Arrow Functions
✅ Destructuring
✅ Spread Operator
✅ Template Literals
✅ Try/Catch/Finally
```

---

### 🛠️ Ferramentas Úteis

| Ferramenta          | Função                            |
| ------------------- | --------------------------------- |
| **Postman**         | Testar APIs                       |
| **MongoDB Compass** | Interface gráfica para MongoDB    |
| **jwt.io**          | Decodificar tokens JWT            |
| **DevTools (F12)**  | Debugar frontend                  |
| **Thunder Client**  | Extensão VS Code para testar APIs |

---

## 💡 Dicas de Estudo

```
1. 🎯 Não tente entender tudo de uma vez
   → Foque em um fluxo por vez

2. 🔍 Use console.log() abundantemente
   → Veja o que está acontecendo em cada etapa

3. 🔨 Quebre o código
   → Mude coisas e veja o que quebra (em ambiente de dev!)

4. 📊 Desenhe diagramas
   → Fluxogramas ajudam a visualizar

5. 🦆 Explique para alguém
   → Ou para um patinho de borracha (rubber duck debugging)

6. 📖 Leia mensagens de erro com calma
   → Elas geralmente dizem exatamente o problema

7. 💾 Commit frequentemente
   → Use Git para poder voltar se quebrar algo

8. 🧪 Teste cada mudança
   → Não faça muitas mudanças de uma vez

9. 📚 Consulte a documentação
   → É a fonte mais confiável

10. 🤝 Peça ajuda quando travar
    → Não fique horas preso no mesmo problema
```

---

## 📊 Glossário Rápido

| Termo           | Significação                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| **API**         | Application Programming Interface - Interface para comunicação entre sistemas |
| **JWT**         | JSON Web Token - Token de autenticação                                        |
| **CRUD**        | Create, Read, Update, Delete - Operações básicas                              |
| **Middleware**  | Função que intercepta requisições                                             |
| **Schema**      | Estrutura/formato dos dados                                                   |
| **Hash**        | Transformação irreversível de dados                                           |
| **Salt**        | Dado aleatório adicionado antes do hash                                       |
| **Token**       | Chave de autenticação temporária                                              |
| **Endpoint**    | URL específica da API                                                         |
| **Query**       | Consulta ao banco de dados                                                    |
| **Payload**     | Dados transportados em uma requisição                                         |
| **Header**      | Metadados de uma requisição HTTP                                              |
| **Body**        | Corpo/conteúdo de uma requisição                                              |
| **Status Code** | Código numérico de resposta HTTP                                              |
| **CORS**        | Cross-Origin Resource Sharing - Política de segurança                         |

---

<div align="center">

**📅 Última atualização:** 2026-04-15  
**📦 Versão do projeto:** 1.0.0  
**🎓 Seu nível:** Iniciante em Backend

---

**🚀 Bons estudos!**

_Feito com ❤️ para te ajudar a aprender_

</div>
