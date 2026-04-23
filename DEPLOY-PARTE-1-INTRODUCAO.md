# 🚀 GUIA COMPLETO DE DEPLOY - PARTE 1: INTRODUÇÃO E CONCEITOS

## 📚 O QUE VOCÊ VAI APRENDER

Este é um curso completo de deploy. Cada linha de código será explicada em detalhes.

**Estrutura do Guia**:

- **Parte 1**: Introdução e Conceitos (este arquivo)
- **Parte 2**: Configuração do Projeto
- **Parte 3**: Deploy Separado (Vercel + Render)
- **Parte 4**: Deploy em Domínio Único (VPS)
- **Parte 5**: Troubleshooting e Manutenção

---

## 1. O QUE É DEPLOY?

### 1.1 Definição Simples

**Deploy** = Colocar sua aplicação no ar, disponível na internet 24/7.

**Antes do Deploy**:

```
Seu Computador
├── Frontend rodando em http://localhost:5173
├── Backend rodando em http://localhost:3000
└── MongoDB rodando em localhost:27017

❌ Só você consegue acessar
❌ Quando desliga o computador, para de funcionar
```

**Depois do Deploy**:

```
Servidores na Nuvem
├── Frontend em https://seu-site.com
├── Backend em https://api.seu-site.com
└── MongoDB em MongoDB Atlas (nuvem)

✅ Qualquer pessoa no mundo pode acessar
✅ Funciona 24 horas por dia, 7 dias por semana
✅ Mesmo com seu computador desligado
```

### 1.2 Por Que Deploy é Importante?

1. **Portfolio Profissional**
   - Recrutadores querem VER a aplicação funcionando
   - Link no currículo tem muito mais impacto que código no GitHub
   - Demonstra que você sabe colocar projetos em produção

2. **Compartilhar com Outros**
   - Amigos, família, clientes podem testar
   - Feedback real de usuários
   - Validar sua ideia

3. **Aprendizado Prático**
   - Experiência com infraestrutura (muito valorizado)
   - Entender ambientes de produção
   - Resolver problemas reais (CORS, SSL, performance)

4. **Testar em Ambiente Real**
   - Descobrir bugs que só aparecem em produção
   - Ver performance real
   - Testar em diferentes dispositivos

---

## 2. DUAS ESTRATÉGIAS DE DEPLOY

### 2.1 Estratégia 1: Deploy Separado (RECOMENDADO)

#### Diagrama Visual

```
┌─────────────────┐
│   USUÁRIO       │
│  (Navegador)    │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│   FRONTEND      │   Requisição │    BACKEND      │
│   (Vercel)      │─────HTTP────▶│   (Render)      │
│                 │              │                 │
│ - HTML/CSS/JS   │              │ - Node.js       │
│ - Vue 3         │              │ - Express       │
│ - Vite          │              │ - TypeScript    │
└─────────────────┘              └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   MONGODB       │
                                 │   (Atlas)       │
                                 │                 │
                                 │ - Banco NoSQL   │
                                 └─────────────────┘

URLs:
Frontend: https://seu-site.vercel.app
Backend:  https://seu-backend.onrender.com
MongoDB:  mongodb+srv://cluster.mongodb.net
```

#### O Que Significa?

**Frontend (Vercel)**:

- Hospeda apenas os arquivos estáticos (HTML, CSS, JavaScript)
- Quando usuário acessa seu-site.com, o Vercel envia esses arquivos
- O navegador do usuário executa o JavaScript (Vue)

**Backend (Render)**:

- Hospeda o servidor Node.js com Express
- Processa requisições da API (login, cadastro, buscar dados)
- Conecta com o banco de dados

**MongoDB (Atlas)**:

- Banco de dados na nuvem
- Armazena todos os dados (usuários, agendamentos, etc)

#### Vantagens

✅ **Totalmente Gratuito**

- Vercel: Plano gratuito ilimitado para projetos pessoais
- Render: 750 horas grátis por mês (suficiente para 1 aplicação 24/7)
- MongoDB Atlas: 512MB grátis (suficiente para começar)

✅ **Fácil de Configurar**

- Conecta com GitHub
- Deploy automático a cada push
- Não precisa configurar servidor Linux, Nginx, etc

✅ **Escalável Independentemente**

- Se frontend recebe muito acesso → só ele escala
- Se backend precisa de mais recursos → só ele escala
- Você paga apenas pelo que usa

✅ **Resiliente**

- Se backend cair → frontend continua mostrando a interface
- Se frontend cair → backend continua funcionando
- Cada parte pode ser atualizada sem afetar as outras

#### Desvantagens

⚠️ **Precisa Configurar CORS**

- Frontend e backend em domínios diferentes
- Navegador bloqueia requisições por segurança
- Solução: Configurar CORS no backend (vamos ensinar)

⚠️ **Três Lugares para Gerenciar**

- Dashboard do Vercel (frontend)
- Dashboard do Render (backend)
- Dashboard do MongoDB Atlas (banco)

⚠️ **Latência Adicional**

- Requisição viaja: Frontend → Backend → MongoDB
- Cada "pulo" adiciona alguns milissegundos
- Na prática, imperceptível para usuários

#### Quando Usar?

- ✅ Projetos pessoais
- ✅ MVPs (Minimum Viable Product)
- ✅ Aprendizado
- ✅ Startups no início
- ✅ 90% dos casos

---

### 2.2 Estratégia 2: Deploy em Domínio Único

#### Diagrama Visual

```
┌─────────────────┐
│   USUÁRIO       │
│  (Navegador)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   SEU SERVIDOR (VPS)            │
│   IP: 123.45.67.89              │
│                                 │
│   ┌─────────────────────────┐   │
│   │       NGINX             │   │  ← Porteiro
│   │   (Reverse Proxy)       │   │
│   └──────────┬──────────────┘   │
│              │                  │
│      ┌───────┴───────┐          │
│      │               │          │
│      ▼               ▼          │
│  ┌────────┐    ┌──────────┐    │
│  │Frontend│    │ Backend  │    │
│  │(dist/) │    │(Node.js) │    │
│  │        │    │  :3000   │    │
│  └────────┘    └─────┬────┘    │
│                      │          │
└──────────────────────┼──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   MONGODB       │
              │   (Atlas)       │
              └─────────────────┘

URLs:
Tudo em: https://seu-dominio.com
API em:  https://seu-dominio.com/api
```

#### O Que Significa?

**VPS (Virtual Private Server)**:

- Um computador virtual na nuvem que você aluga
- Você tem acesso root (controle total)
- Instala o que quiser (Node.js, Nginx, MongoDB, etc)

**Nginx (Reverse Proxy)**:

- Funciona como um "porteiro"
- Recebe todas as requisições
- Decide para onde enviar:
  - `seu-dominio.com/` → Serve arquivos do frontend
  - `seu-dominio.com/api` → Encaminha para backend Node.js

**Frontend (Arquivos Estáticos)**:

- Pasta `dist/` com HTML, CSS, JS compilados
- Nginx serve esses arquivos diretamente
- Muito rápido (sem processamento)

**Backend (Node.js + PM2)**:

- Roda na porta 3000 (localhost)
- PM2 mantém rodando 24/7
- Nginx encaminha requisições `/api` para ele

#### Vantagens

✅ **Um Único Domínio**

- Tudo em `seu-dominio.com`
- Sem problemas de CORS
- URLs mais limpas

✅ **Controle Total**

- Você configura tudo
- Instala qualquer software
- Acesso SSH ao servidor

✅ **Performance**

- Frontend e backend no mesmo servidor
- Comunicação interna mais rápida
- Nginx faz cache de arquivos estáticos

✅ **Aprendizado Profundo**

- Aprende Linux, Nginx, SSL, PM2
- Habilidades muito valorizadas no mercado
- Entende como tudo funciona "por baixo dos panos"

#### Desvantagens

⚠️ **Mais Complexo**

- Precisa configurar servidor Linux
- Instalar e configurar Nginx
- Configurar SSL (certificado HTTPS)
- Gerenciar PM2

⚠️ **Custo Mensal**

- VPS custa ~$5-10/mês (DigitalOcean, Linode, AWS)
- Não tem plano gratuito
- Precisa pagar mesmo sem tráfego

⚠️ **Manutenção**

- Você é responsável por atualizações de segurança
- Monitorar uso de recursos (CPU, memória, disco)
- Fazer backups
- Resolver problemas de servidor

⚠️ **Escalabilidade Manual**

- Se tráfego aumentar muito, precisa:
  - Aumentar recursos do VPS (mais caro)
  - Ou configurar load balancer + múltiplos servidores (complexo)

#### Quando Usar?

- ✅ Projetos profissionais/comerciais
- ✅ Quando precisa de controle total
- ✅ Aplicações com requisitos específicos
- ✅ Quando quer aprender infraestrutura
- ✅ Quando CORS é um problema real

---

## 3. SEU STACK TECNOLÓGICO

### 3.1 Backend

#### Node.js

**O que é**: Ambiente que executa JavaScript no servidor

**Por que existe**:

- JavaScript originalmente só rodava no navegador
- Node.js permite rodar JavaScript no servidor
- Mesma linguagem no frontend e backend

**Como funciona**:

```javascript
// Antes do Node.js (só navegador)
console.log("Olá"); // ✅ Funciona no navegador

// Com Node.js (servidor)
const fs = require("fs");
fs.readFile("arquivo.txt"); // ✅ Funciona no servidor
```

#### Express

**O que é**: Framework para criar APIs REST

**Por que usar**:

- Simplifica criação de rotas
- Middlewares para autenticação, CORS, etc
- Padrão da indústria

**Exemplo**:

```javascript
// Sem Express (Node.js puro) - complexo
const http = require("http");
http
  .createServer((req, res) => {
    if (req.url === "/usuarios" && req.method === "GET") {
      // código para buscar usuários
    }
  })
  .listen(3000);

// Com Express - simples
const express = require("express");
const app = express();
app.get("/usuarios", (req, res) => {
  // código para buscar usuários
});
app.listen(3000);
```

#### TypeScript

**O que é**: JavaScript com tipos

**Por que usar**:

- Previne bugs antes de rodar o código
- Autocomplete melhor no editor
- Código mais fácil de manter

**Exemplo**:

```typescript
// JavaScript - erro só aparece ao rodar
function somar(a, b) {
  return a + b;
}
somar(5, "10"); // ❌ Retorna "510" (concatenação)

// TypeScript - erro aparece ao escrever
function somar(a: number, b: number): number {
  return a + b;
}
somar(5, "10"); // ❌ Erro: "10" não é número
```

#### MongoDB

**O que é**: Banco de dados NoSQL

**Por que usar**:

- Armazena documentos JSON (natural para JavaScript)
- Flexível (não precisa definir schema rígido)
- Escalável

**Exemplo**:

```javascript
// Documento de usuário
{
  "_id": "507f1f77bcf86cd799439011",
  "nome": "João Silva",
  "email": "joao@email.com",
  "agendamentos": [
    { "data": "2024-01-15", "hora": "14:00" }
  ]
}
```

### 3.2 Frontend

#### Vue 3

**O que é**: Framework JavaScript para criar interfaces

**Por que usar**:

- Reativo (atualiza interface automaticamente)
- Componentes reutilizáveis
- Fácil de aprender

**Exemplo**:

```vue
<template>
  <button @click="contador++">Clicado {{ contador }} vezes</button>
</template>

<script setup>
import { ref } from "vue";
const contador = ref(0); // Reativo!
</script>
```

#### Vite

**O que é**: Ferramenta de build super rápida

**Por que usar**:

- Hot Module Replacement (atualiza sem recarregar página)
- Build otimizado para produção
- Muito mais rápido que Webpack

**O que faz**:

```bash
# Desenvolvimento
npm run dev
# Inicia servidor local com hot reload

# Produção
npm run build
# Cria pasta dist/ com código otimizado
```

---

## 4. CONCEITOS FUNDAMENTAIS

### 4.1 Ambientes: Desenvolvimento vs Produção

#### Desenvolvimento (Seu Computador)

**Características**:

```
┌─────────────────────────────┐
│   Seu Computador            │
│                             │
│  Frontend: localhost:5173   │
│  Backend:  localhost:3000   │
│  MongoDB:  localhost:27017  │
│                             │
│  - Código não otimizado     │
│  - Erros no console         │
│  - Hot reload ativo         │
│  - Sem HTTPS                │
└─────────────────────────────┘
```

**Comandos**:

```bash
# Frontend
npm run dev  # Inicia Vite

# Backend
npm run dev  # Inicia tsx (TypeScript executor)
```

**Arquivos usados**:

- `src/` - Código fonte
- `.env` - Variáveis locais
- `node_modules/` - Dependências

#### Produção (Servidor na Nuvem)

**Características**:

```
┌─────────────────────────────┐
│   Servidor na Nuvem         │
│                             │
│  Frontend: seu-site.com     │
│  Backend:  api.seu-site.com │
│  MongoDB:  Atlas            │
│                             │
│  - Código otimizado         │
│  - Erros em logs            │
│  - Sem hot reload           │
│  - HTTPS obrigatório        │
└─────────────────────────────┘
```

**Comandos**:

```bash
# Frontend
npm run build  # Cria dist/
# Servidor web serve arquivos de dist/

# Backend
npm run build  # Compila TypeScript
npm start      # Roda dist/server.js
```

**Arquivos usados**:

- `dist/` - Código compilado
- Variáveis de ambiente na plataforma
- `node_modules/` - Apenas dependências de produção

### 4.2 Variáveis de Ambiente

#### O Que São?

Configurações que ficam **fora do código** e mudam entre ambientes.

#### Por Que Usar?

**❌ ERRADO - Senha no código**:

```javascript
// backend/src/server.ts
mongoose.connect("mongodb://usuario:senha123@servidor.com/banco");
```

**Problemas**:

- Senha vai pro GitHub (público)
- Qualquer um pode ver
- Não pode usar senhas diferentes em dev/prod

**✅ CERTO - Senha em variável de ambiente**:

```javascript
// backend/src/server.ts
mongoose.connect(process.env.MONGO_URI);
```

**Vantagens**:

- Senha não vai pro GitHub
- Cada ambiente tem sua própria senha
- Seguro

#### Como Funciona?

**1. Criar arquivo `.env`** (nunca vai pro Git):

```env
MONGO_URI=mongodb://localhost:27017/medconnect
JWT_SECRET=minha-chave-secreta
```

**2. Adicionar ao `.gitignore`**:

```
.env
```

**3. Usar no código**:

```javascript
import "dotenv/config"; // Carrega variáveis do .env

const senha = process.env.JWT_SECRET;
console.log(senha); // "minha-chave-secreta"
```

**4. Em produção** (Render, Vercel):

- Não usa arquivo `.env`
- Configura variáveis no dashboard da plataforma
- Plataforma injeta as variáveis no `process.env`

---

**CONTINUA NA PARTE 2...**

Próximos tópicos:

- Build e compilação
- CORS explicado em detalhes
- Nginx e Reverse Proxy
- SSL/HTTPS
- PM2 Process Manager
