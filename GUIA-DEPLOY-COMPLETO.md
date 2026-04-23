# �� GUIA COMPLETO DE DEPLOY - MedConnect
## Do Zero ao Ar - Curso Completo com Explicações Detalhadas de Cada Linha

> **IMPORTANTE**: Este é um guia educacional completo. Cada código tem explicação detalhada do que faz e por quê.

---

## 📋 ÍNDICE

**PARTE 1 - FUNDAMENTOS**
1. [O que é Deploy?](#1-o-que-é-deploy)
2. [Conceitos Essenciais](#2-conceitos-essenciais)
3. [Preparação do Projeto](#3-preparação-do-projeto)

**PARTE 2 - DEPLOY SEPARADO (Recomendado)**
4. [Configurar MongoDB Atlas](#4-mongodb-atlas)
5. [Deploy do Backend (Render)](#5-deploy-backend)
6. [Deploy do Frontend (Vercel)](#6-deploy-frontend)

**PARTE 3 - DEPLOY ÚNICO**
7. [VPS com Nginx](#7-vps-nginx)

**PARTE 4 - FINALIZAÇÃO**
8. [Domínio Personalizado](#8-domínio)
9. [Monitoramento](#9-monitoramento)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. O QUE É DEPLOY?

### 1.1 Definição Simples

**Deploy** = Colocar sua aplicação na internet para outras pessoas acessarem.

**Antes do Deploy:**
- Aplicação roda só no seu computador
- URL: `http://localhost:3000`
- Só você consegue acessar

**Depois do Deploy:**
- Aplicação roda em servidor na nuvem (24/7)
- URL: `https://seu-dominio.com`
- Qualquer pessoa no mundo pode acessar

### 1.2 Analogia

É como **mudar de casa**:
- Você pega tudo que está no seu computador (localhost)
- Coloca em um servidor na nuvem que fica ligado 24 horas
- Outras pessoas podem "visitar" sua aplicação

### 1.3 Por Que Deploy é Importante?

1. **Portfolio**: Recrutadores querem ver projetos funcionando (não só código)
2. **Compartilhar**: Amigos/clientes podem testar
3. **Aprendizado**: Experiência real com infraestrutura
4. **Validação**: Testar em ambiente real (não só localhost)

---

## 2. CONCEITOS ESSENCIAIS

### 2.1 Desenvolvimento vs Produção

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Onde roda** | Seu computador | Servidor na nuvem |
| **URL** | localhost:3000 | seu-dominio.com |
| **Quando roda** | Só quando você inicia | 24/7 |
| **Erros** | Console do navegador | Arquivos de log |
| **Código** | Não otimizado | Minificado e otimizado |
| **HTTPS** | Opcional | Obrigatório |

### 2.2 Variáveis de Ambiente

**O que são?**
Configurações que ficam FORA do código e mudam entre ambientes.

**Exemplo do problema:**
```javascript
// ❌ ERRADO - senha exposta no código
const dbPassword = "minhaSenha123"

// ✅ CERTO - senha em variável de ambiente
const dbPassword = process.env.DB_PASSWORD
```

**Como funciona:**

1. **Criar arquivo `.env`** (nunca vai pro Git):
```env
DB_PASSWORD=minhaSenha123
API_KEY=abc123xyz
```

2. **Usar no código**:
```javascript
const senha = process.env.DB_PASSWORD
```

3. **Em produção**: Configurar na plataforma (Render, Vercel)

**Por que usar?**
- ✅ Segurança: Senhas não vão pro GitHub
- ✅ Flexibilidade: Mesma aplicação, configurações diferentes
- ✅ Padrão da indústria

### 2.3 Build (Compilação)

**O que é?**
Transformar código de desenvolvimento em código otimizado para produção.

#### Backend: TypeScript → JavaScript

```bash
# Comando
npm run build

# O que acontece:
# backend/src/server.ts  →  backend/dist/server.js
# (TypeScript)              (JavaScript)
```

**Por quê?**
- Navegadores não entendem TypeScript
- Remove tipos e transforma para JavaScript puro

#### Frontend: Vue → HTML/CSS/JS

```bash
# Comando
npm run build

# O que acontece:
# frontend/src/  →  frontend/dist/
#   App.vue          index.html
#   components/      assets/index-abc123.js (minificado)
#   views/           assets/index-def456.css (minificado)
```

**O que o build faz:**
1. Compila arquivos `.vue` para JavaScript
2. Minifica código (remove espaços, comentários)
3. Otimiza imagens
4. Gera hashes nos nomes (ex: `index-abc123.js`) para cache
5. Cria um único HTML que carrega tudo

### 2.4 CORS (Cross-Origin Resource Sharing)

**O que é?**
Mecanismo de segurança do navegador que bloqueia requisições entre domínios diferentes.

**Exemplo do problema:**
```
Usuário acessa: https://meu-site.com (frontend)
                      ↓
Frontend tenta chamar: https://api.meu-site.com (backend)
                      ↓
❌ Navegador bloqueia!
Erro: "Access to XMLHttpRequest has been blocked by CORS policy"
```

**Por que existe?**
Segurança! Impede que um site malicioso faça requisições para sua API.

**Solução: Configurar backend para permitir frontend**

```javascript
// backend/src/server.ts
import cors from 'cors'

app.use(cors({
    origin: 'https://meu-site.com',  // ← Permite APENAS este domínio
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // ← Métodos HTTP permitidos
    credentials: true  // ← Permite enviar cookies
}))
```

**Quando NÃO tem problema de CORS?**
- Frontend e backend no mesmo domínio:
  - `seu-site.com` (frontend)
  - `seu-site.com/api` (backend)

### 2.5 HTTPS e SSL

**HTTP vs HTTPS:**
- `http://` - Dados trafegam em texto puro (inseguro) ❌
- `https://` - Dados criptografados (seguro) ✅

**Por que HTTPS é obrigatório?**
1. Navegadores marcam HTTP como "Não seguro"
2. Google penaliza sites sem HTTPS
3. Senhas e tokens ficam expostos sem HTTPS

**Como obter certificado SSL:**
- **Plataformas gerenciadas** (Vercel, Render): Automático e grátis ✅
- **VPS**: Let's Encrypt (grátis) via Certbot

---

## 3. PREPARAÇÃO DO PROJETO

### 3.1 Estrutura Atual do Projeto

```
med-connect/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.vue
    │   ├── components/
    │   ├── views/
    │   └── router/
    ├── package.json
    └── vite.config.ts
```

### 3.2 Configurar Variáveis de Ambiente - BACKEND

#### Passo 1: Criar arquivo `.env`

**Onde:** Na raiz da pasta `backend/`

**Como criar:**
```bash
cd backend
touch .env
```

#### Passo 2: Adicionar conteúdo ao `.env`

**Arquivo:** `backend/.env`

```env
# ============================================
# CONFIGURAÇÕES DO SERVIDOR
# ============================================

# Porta onde o servidor vai rodar
# Em produção, a plataforma define automaticamente
PORT=3000

# Ambiente: development ou production
# Muda comportamento de logs, erros, etc
NODE_ENV=production


# ============================================
# BANCO DE DADOS
# ============================================

# Connection string do MongoDB Atlas
# Formato: mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco
# Vamos pegar isso no MongoDB Atlas (próxima seção)
MONGO_URI=mongodb+srv://seu-usuario:sua-senha@cluster.mongodb.net/medconnect?retryWrites=true&w=majority


# ============================================
# AUTENTICAÇÃO JWT
# ============================================

# Chave secreta para assinar tokens JWT
# DEVE ser uma string aleatória e segura (mínimo 32 caracteres)
# Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=sua_chave_secreta_super_segura_aqui_minimo_32_caracteres_aleatorios


# ============================================
# EMAIL (Nodemailer)
# ============================================

# Servidor SMTP (Gmail, Outlook, etc)
EMAIL_HOST=smtp.gmail.com

# Porta SMTP (587 para TLS, 465 para SSL)
EMAIL_PORT=587

# Seu email
EMAIL_USER=seu-email@gmail.com

# Senha de app do Gmail (NÃO é a senha normal!)
# Como gerar: https://support.google.com/accounts/answer/185833
EMAIL_PASS=sua-senha-de-app-do-gmail


# ============================================
# CORS
# ============================================

# URL do frontend em produção
# Usado para permitir requisições do frontend
FRONTEND_URL=https://seu-dominio.com
```

**EXPLICAÇÃO LINHA POR LINHA:**

1. **PORT=3000**
   - Define em qual porta o servidor vai rodar
   - Em produção, plataformas como Render definem automaticamente
   - Você pode deixar 3000 mesmo

2. **NODE_ENV=production**
   - Diz ao Node.js que está em produção
   - Muda comportamento: menos logs, erros não mostram stack trace completo
   - Em desenvolvimento, use `development`

3. **MONGO_URI**
   - String de conexão com MongoDB
   - Vamos pegar isso quando configurar MongoDB Atlas
   - Contém: usuário, senha, endereço do cluster, nome do banco

4. **JWT_SECRET**
   - Chave secreta para assinar tokens de autenticação
   - NUNCA use algo óbvio como "123456"
   - Gere uma chave aleatória (vou ensinar como)

5. **EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS**
   - Configurações para enviar emails
   - Seu projeto usa Nodemailer para enviar emails
   - Gmail exige "senha de app" (não é a senha normal)

6. **FRONTEND_URL**
   - URL onde seu frontend está hospedado
   - Usado no CORS para permitir requisições
   - Exemplo: `https://medconnect.vercel.app`

#### Passo 3: Gerar JWT_SECRET seguro

**No terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Saída (exemplo):**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Copie e cole no `.env`:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

#### Passo 4: Atualizar `.gitignore`

**MUITO IMPORTANTE:** Nunca commite o arquivo `.env` no Git!

**Arquivo:** `backend/.gitignore`

```gitignore
# Dependências
node_modules/

# Build
dist/

# Variáveis de ambiente (NUNCA COMMITAR!)
.env

# Logs
*.log
npm-debug.log*

# Sistema operacional
.DS_Store
Thumbs.db
```

**Por quê?**
- `.env` contém senhas e chaves secretas
- Se subir pro GitHub, qualquer um pode ver
- Hackers procuram repositórios com `.env` exposto

#### Passo 5: Criar `.env.example`

**Para quê?**
- Mostrar quais variáveis são necessárias
- Sem expor valores reais
- Outros desenvolvedores sabem o que configurar

**Arquivo:** `backend/.env.example`

```env
PORT=3000
NODE_ENV=production
MONGO_URI=
JWT_SECRET=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=
```

**Este arquivo SIM vai pro Git!**

