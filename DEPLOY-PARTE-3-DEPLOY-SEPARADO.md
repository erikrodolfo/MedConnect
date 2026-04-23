# 🚀 GUIA COMPLETO DE DEPLOY - PARTE 3: DEPLOY SEPARADO (VERCEL + RENDER)

## 📚 NESTA PARTE

Vamos fazer o deploy completo da aplicação usando plataformas gratuitas.

**Arquitetura**:

```
Frontend (Vercel) → Backend (Render) → MongoDB (Atlas)
```

---

## 1. PREPARAR REPOSITÓRIO GITHUB

### 1.1 Por Que GitHub?

Plataformas como Vercel e Render fazem deploy direto do GitHub:

- ✅ Push no GitHub → Deploy automático
- ✅ Histórico de versões
- ✅ Rollback fácil (voltar versão anterior)

### 1.2 Verificar `.gitignore`

**Backend** (`backend/.gitignore`):

```
# Dependências
node_modules/

# Build
dist/

# Ambiente
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*

# Sistema
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

**Frontend** (`frontend/.gitignore`):

```
# Dependências
node_modules/

# Build
dist/
dist-ssr/

# Ambiente
.env
.env.local
.env.production

# Logs
*.log

# Sistema
.DS_Store

# IDE
.vscode/
.idea/
```

### 1.3 Commitar e Enviar para GitHub

```bash
# Na raiz do projeto
git add .
git commit -m "Preparar projeto para deploy"
git push origin main
```

---

## 2. DEPLOY DO BACKEND (RENDER)

### 2.1 Por Que Render?

- ✅ **Gratuito**: 750 horas/mês (suficiente para 1 app 24/7)
- ✅ **Fácil**: Deploy automático do GitHub
- ✅ **SSL grátis**: HTTPS automático
- ✅ **Logs**: Ver erros em tempo real

**Limitações do plano gratuito**:

- ⚠️ Servidor "dorme" após 15 minutos sem uso
- ⚠️ Primeira requisição após dormir demora ~30 segundos
- ⚠️ 512MB RAM

### 2.2 Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Clique em "Get Started"
3. Escolha "Sign up with GitHub"
4. Autorize Render a acessar seus repositórios

### 2.3 Criar Web Service

#### Passo 1: New Web Service

1. No dashboard, clique em "New +"
2. Escolha "Web Service"
3. Conecte seu repositório GitHub
4. Se não aparecer, clique em "Configure account" e dê acesso

#### Passo 2: Configurações Básicas

**Name**: `medconnect-backend`

- Nome único no Render
- Será usado na URL: `medconnect-backend.onrender.com`

**Region**: `Oregon (US West)`

- Escolha mais próxima (não tem Brasil no plano gratuito)

**Branch**: `main`

- Branch que será deployada

**Root Directory**: `backend`

- ⚠️ **IMPORTANTE**: Seu backend está na pasta `backend/`
- Render precisa saber onde está o código

#### Passo 3: Configurações de Build

**Runtime**: `Node`

- Render detecta automaticamente

**Build Command**:

```bash
npm install && npm run build
```

**O que faz**:

1. `npm install`: Instala dependências
2. `npm run build`: Compila TypeScript (cria pasta `dist/`)

**Start Command**:

```bash
npm start
```

**O que faz**:

- Executa `node dist/server.js`
- Inicia servidor em produção

#### Passo 4: Plano

**Instance Type**: `Free`

- 512MB RAM
- Servidor dorme após 15min inativo

#### Passo 5: Variáveis de Ambiente

Clique em "Advanced" e adicione:

**NODE_ENV**:

```
production
```

**Por quê**: Ativa modo produção (otimizações, menos logs)

**MONGO_URI**:

```
mongodb+srv://medconnect_user:SUA_SENHA@cluster0.xxxxx.mongodb.net/medconnect?retryWrites=true&w=majority
```

**Por quê**: Connection string do MongoDB Atlas

**JWT_SECRET**:

```
[gere uma chave forte]
```

**Como gerar**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Por quê**: Chave para assinar tokens JWT

**EMAIL_HOST**:

```
smtp.gmail.com
```

**EMAIL_PORT**:

```
587
```

**EMAIL_USER**:

```
seu-email@gmail.com
```

**EMAIL_PASS**:

```
sua-senha-de-app
```

**EMAIL_FROM**:

```
MedConnect <noreply@medconnect.com>
```

**FRONTEND_URL**:

```
https://seu-frontend.vercel.app
```

**⚠️ ATENÇÃO**: Vamos preencher depois que fizer deploy do frontend

Por enquanto, deixe:

```
http://localhost:5173
```

#### Passo 6: Criar Web Service

1. Clique em "Create Web Service"
2. Aguarde o deploy (3-5 minutos)
3. Acompanhe os logs em tempo real

### 2.4 Verificar Deploy

Quando aparecer "Live" (bolinha verde):

1. Copie a URL: `https://medconnect-backend.onrender.com`
2. Acesse: `https://medconnect-backend.onrender.com/health`

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

✅ **Backend no ar!**

### 2.5 Resolver Problema do "Sleep"

**Problema**: Servidor dorme após 15min sem uso.

**Solução 1: UptimeRobot (Recomendado)**

1. Acesse [uptimerobot.com](https://uptimerobot.com)
2. Crie conta gratuita
3. Clique em "Add New Monitor"
4. Monitor Type: "HTTP(s)"
5. Friendly Name: "MedConnect Backend"
6. URL: `https://medconnect-backend.onrender.com/health`
7. Monitoring Interval: "5 minutes"
8. Clique em "Create Monitor"

**Como funciona**:

- UptimeRobot faz requisição a cada 5 minutos
- Mantém servidor acordado
- Bonus: Recebe email se servidor cair

**Solução 2: Cron Job (Alternativa)**

Criar rota no backend que faz requisição para si mesmo:

```typescript
// backend/src/server.ts

// Manter servidor acordado (apenas em produção)
if (process.env.NODE_ENV === "production") {
  setInterval(
    async () => {
      try {
        await fetch(`${process.env.BACKEND_URL}/health`);
        console.log("🏓 Keep-alive ping");
      } catch (error) {
        console.error("❌ Keep-alive falhou:", error);
      }
    },
    14 * 60 * 1000,
  ); // 14 minutos
}
```

---

## 3. DEPLOY DO FRONTEND (VERCEL)

### 3.1 Por Que Vercel?

- ✅ **Gratuito**: Ilimitado para projetos pessoais
- ✅ **Rápido**: CDN global (site carrega rápido em qualquer lugar)
- ✅ **SSL grátis**: HTTPS automático
- ✅ **Deploy automático**: Push no GitHub → Deploy

### 3.2 Criar Conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize Vercel

### 3.3 Importar Projeto

#### Passo 1: Add New Project

1. No dashboard, clique em "Add New..."
2. Escolha "Project"
3. Selecione seu repositório "MedConnect"
4. Clique em "Import"

#### Passo 2: Configurar Projeto

**Framework Preset**: `Vite`

- Vercel detecta automaticamente

**Root Directory**: `frontend`

- ⚠️ **IMPORTANTE**: Clique em "Edit" e selecione `frontend/`
- Seu frontend está na pasta `frontend/`

**Build Command**:

```bash
npm run build
```

**O que faz**:

- Compila Vue + TypeScript
- Otimiza código
- Cria pasta `dist/`

**Output Directory**: `dist`

- Pasta com arquivos compilados

**Install Command**:

```bash
npm install
```

#### Passo 3: Variáveis de Ambiente

Clique em "Environment Variables" e adicione:

**Name**: `VITE_API_URL`
**Value**: `https://medconnect-backend.onrender.com`
**⚠️ IMPORTANTE**: Use a URL do seu backend no Render

**Environments**: Marque todas (Production, Preview, Development)

#### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguarde (1-2 minutos)
3. Vercel compila e faz deploy

### 3.4 Verificar Deploy

Quando aparecer "Congratulations":

1. Clique em "Visit"
2. Seu site está no ar! 🎉

URL será algo como: `https://medconnect-abc123.vercel.app`

### 3.5 Configurar Domínio Personalizado (Opcional)

#### Usar Domínio Vercel

1. Vá em "Settings" → "Domains"
2. Adicione: `medconnect-seu-nome.vercel.app`
3. Clique em "Add"

#### Usar Domínio Próprio

Se você tem um domínio (ex: `medconnect.com`):

1. Vá em "Settings" → "Domains"
2. Adicione: `medconnect.com`
3. Vercel mostra registros DNS para configurar
4. No seu registrador (Namecheap, GoDaddy, etc):
   - Adicione registro A: `76.76.21.21`
   - Adicione registro CNAME: `cname.vercel-dns.com`
5. Aguarde propagação (até 48h, geralmente 1h)

---

## 4. CONECTAR FRONTEND E BACKEND

### 4.1 Atualizar CORS no Backend

Agora que frontend está no ar, precisamos permitir requisições dele.

#### No Render:

1. Acesse seu Web Service no Render
2. Vá em "Environment"
3. Edite `FRONTEND_URL`
4. Valor: `https://medconnect-abc123.vercel.app` (sua URL do Vercel)
5. Clique em "Save Changes"
6. Render faz redeploy automaticamente

#### Ou edite o código:

`backend/src/server.ts`:

```typescript
const allowedOrigins = [
  "https://medconnect-abc123.vercel.app", // Produção
  "http://localhost:5173", // Desenvolvimento
];
```

Commit e push:

```bash
git add .
git commit -m "Atualizar CORS para produção"
git push origin main
```

Render faz deploy automaticamente.

### 4.2 Testar Integração

1. Acesse seu frontend: `https://medconnect-abc123.vercel.app`
2. Abra DevTools (F12) → Network
3. Tente fazer login
4. Verifique se requisições para backend estão funcionando

**Se der erro de CORS**:

- Verifique `FRONTEND_URL` no Render
- Verifique se URL está correta (com https://)
- Aguarde redeploy do backend (1-2 minutos)

---

## 5. CONFIGURAR DEPLOY AUTOMÁTICO

### 5.1 Como Funciona

```
Você faz mudança no código
        ↓
    git push origin main
        ↓
    GitHub recebe push
        ↓
    ┌─────────────────┐
    │ Vercel detecta  │ → Deploy frontend
    │ Render detecta  │ → Deploy backend
    └─────────────────┘
        ↓
    Aplicação atualizada!
```

### 5.2 Testar

1. Faça uma mudança no código (ex: mude um texto)
2. Commit e push:

```bash
git add .
git commit -m "Testar deploy automático"
git push origin main
```

3. Acesse dashboards do Vercel e Render
4. Veja deploy acontecendo em tempo real
5. Aguarde conclusão (1-3 minutos)
6. Acesse seu site e veja mudança aplicada

---

## 6. MONITORAMENTO

### 6.1 Logs do Backend (Render)

1. Acesse seu Web Service no Render
2. Clique em "Logs"
3. Veja logs em tempo real
4. Útil para debugar erros

**Filtrar logs**:

- Clique no ícone de filtro
- Escolha nível: Info, Warning, Error

### 6.2 Logs do Frontend (Vercel)

1. Acesse seu projeto no Vercel
2. Clique em "Deployments"
3. Clique em um deployment
4. Veja logs do build

**Logs de runtime**:

- Frontend não tem logs de runtime (roda no navegador)
- Use DevTools (F12) → Console

### 6.3 Analytics (Vercel)

1. Vá em "Analytics" no Vercel
2. Veja:
   - Número de visitantes
   - Páginas mais acessadas
   - Performance (Core Web Vitals)
   - Erros

### 6.4 Uptime Monitoring

Já configuramos UptimeRobot para backend.

**Para frontend**:

1. No UptimeRobot, adicione outro monitor
2. URL: `https://medconnect-abc123.vercel.app`
3. Monitoring Interval: "5 minutes"

**Notificações**:

- Configure email/SMS para ser avisado se site cair
- Vá em "My Settings" → "Alert Contacts"

---

## 7. TROUBLESHOOTING

### 7.1 Backend não inicia

**Erro**: "Application failed to respond"

**Causas comuns**:

1. **Porta errada**:

```typescript
// ❌ ERRADO
app.listen(3000);

// ✅ CERTO
app.listen(process.env.PORT || 3000);
```

2. **MongoDB não conecta**:

- Verifique `MONGO_URI` no Render
- Teste connection string localmente
- Verifique Network Access no MongoDB Atlas

3. **Dependências faltando**:

```bash
# Verifique se todas as dependências estão em "dependencies"
# NÃO em "devDependencies"
```

**Solução**:

- Veja logs no Render
- Procure linha com erro
- Corrija e faça push

### 7.2 Frontend não carrega

**Erro**: Página em branco

**Causas comuns**:

1. **Build falhou**:

- Veja logs do deployment no Vercel
- Procure erros de TypeScript
- Corrija e faça push

2. **Variável de ambiente errada**:

- Verifique `VITE_API_URL` no Vercel
- Deve ser URL do backend (com https://)

3. **Rota não encontrada**:

- Vercel precisa redirecionar todas as rotas para `index.html`
- Crie `vercel.json` na raiz do projeto:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 7.3 CORS Error

**Erro**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solução**:

1. Verifique `FRONTEND_URL` no Render
2. Deve ser exatamente a URL do Vercel (com https://)
3. Sem barra no final: ✅ `https://site.com` ❌ `https://site.com/`
4. Aguarde redeploy do backend

### 7.4 Backend demora para responder

**Causa**: Servidor dormiu (plano gratuito do Render)

**Soluções**:

1. **UptimeRobot** (recomendado): Mantém servidor acordado
2. **Upgrade para plano pago**: $7/mês, servidor nunca dorme
3. **Mostrar loading**: Avise usuário que primeira requisição demora

```typescript
// frontend
const login = async () => {
  loading.value = true;
  loadingMessage.value = "Conectando ao servidor (pode demorar 30s)...";

  try {
    await api.post("/auth/login", dados);
  } finally {
    loading.value = false;
  }
};
```

### 7.5 Variáveis de ambiente não funcionam

**Frontend**:

1. Variáveis devem começar com `VITE_`
2. Após mudar variável no Vercel, faça redeploy:
   - Vá em "Deployments"
   - Clique nos 3 pontos do último deployment
   - "Redeploy"

**Backend**:

1. Após mudar variável no Render, aguarde redeploy automático
2. Ou force redeploy:
   - Clique em "Manual Deploy" → "Deploy latest commit"

---

## 8. CHECKLIST DE DEPLOY

### Antes do Deploy

- [ ] Código funcionando localmente
- [ ] `.env` configurado (não vai pro Git)
- [ ] `.gitignore` configurado
- [ ] MongoDB Atlas criado e testado
- [ ] Código commitado e no GitHub

### Deploy Backend (Render)

- [ ] Conta criada no Render
- [ ] Web Service criado
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído (bolinha verde)
- [ ] `/health` retorna status ok
- [ ] UptimeRobot configurado

### Deploy Frontend (Vercel)

- [ ] Conta criada no Vercel
- [ ] Projeto importado
- [ ] Root Directory: `frontend`
- [ ] `VITE_API_URL` configurada
- [ ] Deploy concluído
- [ ] Site abre no navegador
- [ ] Integração com backend funcionando

### Pós-Deploy

- [ ] CORS configurado (frontend pode chamar backend)
- [ ] Testar login/cadastro
- [ ] Testar todas as funcionalidades
- [ ] Monitoramento configurado (UptimeRobot)
- [ ] Deploy automático funcionando (push → deploy)

---

## 9. PRÓXIMOS PASSOS

### 9.1 Melhorias

1. **Domínio personalizado**: `medconnect.com` em vez de `vercel.app`
2. **Email profissional**: SendGrid em vez de Gmail
3. **Analytics**: Google Analytics, Hotjar
4. **Sentry**: Monitoramento de erros
5. **CI/CD**: Testes automáticos antes do deploy

### 9.2 Upgrade para Planos Pagos

**Quando considerar**:

**Render** ($7/mês):

- Servidor nunca dorme
- 512MB → 2GB RAM
- Melhor performance

**Vercel** ($20/mês):

- Mais builds por mês
- Analytics avançado
- Suporte prioritário

**MongoDB Atlas** ($9/mês):

- 512MB → 2GB storage
- Backups automáticos
- Melhor performance

---

**CONTINUA NA PARTE 4...**

Próximos tópicos:

- Deploy em Domínio Único (VPS)
- Configurar Nginx
- Configurar SSL com Let's Encrypt
- PM2 para gerenciar Node.js
- Deploy manual passo a passo
