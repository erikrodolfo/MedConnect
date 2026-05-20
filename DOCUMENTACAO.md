# Med Connect — Documentação Detalhada

---

## Visão Geral

O Med Connect é um sistema web para gerenciamento de agendamentos médicos, composto por um **backend** (API RESTful em Node.js/Express/TypeScript) e um **frontend** (SPA em Vue.js). O sistema permite cadastro, autenticação, agendamento, upload de arquivos e gerenciamento de usuários.

---

## Estrutura de Pastas

```
med-connect/
│
├── backend/         # API, lógica de negócio, banco de dados
│   ├── src/
│   │   ├── config/          # Configurações (ex: banco, autenticação)
│   │   ├── controllers/     # Lógica dos endpoints
│   │   ├── middlewares/     # Middlewares (ex: autenticação)
│   │   ├── models/          # Modelos das entidades
│   │   ├── routes/          # Definição das rotas
│   │   ├── utils/           # Funções utilitárias
│   │   └── server.ts        # Inicialização do servidor
│   ├── uploads/             # Arquivos enviados pelos usuários
│   ├── .env                 # Variáveis de ambiente
│   └── package.json         # Dependências do backend
│
├── frontend/        # Aplicação Vue.js
│   ├── src/
│   │   ├── assets/          # Imagens, ícones, etc.
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── router/          # Rotas da aplicação
│   │   ├── services/        # Integração com API
│   │   ├── store/           # Gerenciamento de estado (Vuex/Pinia)
│   │   ├── styles/          # CSS global e variáveis
│   │   ├── views/           # Telas principais
│   │   ├── App.vue          # Componente raiz
│   │   └── main.js/ts       # Inicialização do app
│   └── package.json         # Dependências do frontend
│
├── uploads/         # (link simbólico ou pasta compartilhada)
├── .gitignore
└── DOCUMENTACAO.md  # Este arquivo
```

---

## Backend

### Tecnologias e Bibliotecas

- **Node.js** + **Express**: Servidor HTTP e roteamento.
- **TypeScript**: Tipagem estática.
- **ORM**: Sequelize ou TypeORM (para abstração do banco de dados).
- **JWT**: Autenticação baseada em tokens.
- **bcrypt**: Hash de senhas.
- **multer**: Upload de arquivos.
- **dotenv**: Variáveis de ambiente.
- **cors**: Permitir requisições do frontend.

### Fluxo de Funcionamento

1. **Inicialização**: `server.ts` carrega variáveis de ambiente, conecta ao banco e inicia o servidor Express.
2. **Rotas**: Definidas em `routes/`, agrupadas por recurso (usuários, agendamentos, uploads).
3. **Controllers**: Cada rota chama um controller responsável pela lógica (ex: `agendamento.controller.ts`).
4. **Middlewares**: Funções intermediárias, como autenticação JWT, validação de dados e tratamento de erros.
5. **Models**: Representam tabelas do banco (Usuário, Agendamento, etc.).
6. **Uploads**: Rota específica para upload de arquivos, usando `multer`.
7. **Respostas**: Sempre em JSON, com status HTTP apropriado.

### Principais Arquivos e Funções

- **server.ts**: Inicializa o app, aplica middlewares globais, conecta ao banco.
- **routes/**: 
  - `user.routes.ts`: Cadastro, login, listagem, edição e exclusão de usuários.
  - `agendamento.routes.ts`: CRUD de agendamentos.
  - `upload.routes.ts`: Upload de arquivos.
- **controllers/**:
  - `user.controller.ts`: 
    - `register`: Cria usuário, valida dados, faz hash da senha.
    - `login`: Valida credenciais, gera JWT.
    - `getProfile`: Retorna dados do usuário autenticado.
    - `update`, `delete`: Edita/exclui usuário.
  - `agendamento.controller.ts`:
    - `create`: Cria novo agendamento.
    - `list`: Lista agendamentos (por usuário ou geral).
    - `update`, `delete`: Edita/exclui agendamento.
- **middlewares/**:
  - `auth.ts`: Verifica JWT no header Authorization.
  - `errorHandler.ts`: Captura e responde erros.
- **models/**:
  - `User.ts`: id, nome, email, senha (hash), tipo (admin/paciente/médico), etc.
  - `Agendamento.ts`: id, data, hora, usuárioId, status, etc.

### Exemplo de Fluxo de Autenticação

1. Usuário envia email/senha para `/api/users/login`.
2. Controller valida dados, compara senha com hash usando `bcrypt`.
3. Se válido, gera JWT com dados do usuário.
4. Frontend armazena token e usa em requisições futuras.
5. Middleware `auth` protege rotas privadas, validando o token.

---

## Frontend

### Tecnologias e Bibliotecas

- **Vue.js**: Framework principal.
- **Vue Router**: Navegação SPA.
- **Axios**: Requisições HTTP.
- **Pinia/Vuex**: Gerenciamento de estado global.
- **Vee-validate/Yup**: Validação de formulários.
- **CSS Modules/SCSS**: Estilização.

### Estrutura e Fluxo

1. **main.js/ts**: Inicializa Vue, plugins, rotas e store.
2. **router/index.js/ts**: Define rotas públicas e protegidas (ex: login, dashboard, agendamentos).
3. **store/**: Armazena estado global (usuário autenticado, dados de agendamentos, etc.).
4. **services/api.js/ts**: Configura Axios, define funções para consumir endpoints do backend.
5. **components/**: 
   - `InputField.vue`, `BaseButton.vue`: Componentes reutilizáveis.
   - `Navbar.vue`, `Sidebar.vue`: Navegação.
6. **views/**:
   - `Login.vue`: Tela de login.
   - `Dashboard.vue`: Tela principal após login.
   - `Agendamentos.vue`: Listagem e gerenciamento de agendamentos.
   - `Perfil.vue`: Dados do usuário.
   - `Cadastro.vue`: Cadastro de novos usuários.
7. **assets/**: Imagens, logos, ícones.
8. **styles/**: CSS global, variáveis, temas.

### Principais Métodos e Funções

- **Autenticação**:
  - `login(email, senha)`: Chama API, armazena token.
  - `logout()`: Limpa token e estado.
  - `isAuthenticated()`: Verifica existência do token.
- **Agendamentos**:
  - `getAgendamentos()`: Busca lista do backend.
  - `createAgendamento(dados)`: Envia novo agendamento.
  - `updateAgendamento(id, dados)`: Edita agendamento.
  - `deleteAgendamento(id)`: Remove agendamento.
- **Upload**:
  - `uploadArquivo(formData)`: Envia arquivo para backend.
- **Validação**:
  - Campos obrigatórios, formatos de email, senha forte, etc.

### Fluxo de Usuário

1. Usuário acessa `/login`, faz autenticação.
2. Após login, navega para `/dashboard`.
3. Pode acessar `/agendamentos` para visualizar, criar, editar ou excluir agendamentos.
4. Pode acessar `/perfil` para editar dados pessoais.
5. Uploads de arquivos (ex: foto de perfil) são feitos via formulário.
6. Logout encerra sessão e limpa dados locais.

---

## Integração Frontend <-> Backend

- **Comunicação via HTTP**: Axios faz requisições para endpoints REST do backend.
- **Token JWT**: Enviado no header Authorization para rotas protegidas.
- **Respostas**: Sempre em JSON, tratadas no frontend para exibir mensagens, atualizar estado, etc.
- **Uploads**: Envio de arquivos via `multipart/form-data`.

---

## Bibliotecas Necessárias

### Backend

- `express`, `typescript`, `jsonwebtoken`, `bcrypt`, `multer`, `dotenv`, `cors`, `sequelize` ou `typeorm`

### Frontend

- `vue`, `vue-router`, `axios`, `pinia` ou `vuex`, `vee-validate`, `yup`, `sass` (opcional)

Instale com:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Segurança e Boas Práticas

- **Senhas**: Sempre armazenadas com hash (bcrypt).
- **Tokens**: Expiram após tempo definido.
- **Uploads**: Apenas tipos permitidos, limite de tamanho.
- **Variáveis sensíveis**: Nunca versionadas, sempre em `.env`.
- **Validação**: Tanto no frontend quanto no backend.

---

## Observações Finais

- Consulte os arquivos `GUIA-*.md` para exemplos de uso e deploy.
- Para detalhes de cada endpoint, veja os controllers no backend.
- Para detalhes de cada tela, veja os arquivos em `frontend/src/views/`.
- O projeto é modular e pode ser expandido para incluir notificações, relatórios, etc.

---

Se precisar de explicações sobre um arquivo, função ou fluxo específico, envie o nome ou trecho e detalho para você!