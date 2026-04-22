# Requirements Document - Password Recovery System

## Introduction

Este documento especifica os requisitos para o sistema de recuperação de senha da aplicação MedConnect. O sistema permitirá que usuários que esqueceram suas senhas possam redefini-las de forma segura através de um token enviado por email. O sistema inclui endpoints backend para solicitação e validação de recuperação, páginas frontend para interação do usuário, e mecanismos de segurança para prevenir abuso.

## Glossary

- **Password_Recovery_System**: Sistema completo de recuperação de senha incluindo backend e frontend
- **Recovery_Token**: Token único e criptograficamente seguro usado para validar solicitações de recuperação de senha
- **Token_Generator**: Componente responsável por gerar tokens seguros usando crypto.randomBytes
- **Token_Validator**: Componente responsável por validar tokens e verificar expiração
- **Email_Service**: Serviço responsável por enviar emails com links de recuperação
- **Usuario_Model**: Modelo MongoDB que armazena dados do usuário incluindo tokens de recuperação
- **Forgot_Password_Endpoint**: Endpoint POST /auth/forgot-password que inicia o processo de recuperação
- **Reset_Password_Endpoint**: Endpoint POST /auth/reset-password que completa o processo de recuperação
- **Forgot_Password_Page**: Página frontend onde usuário insere email para recuperação
- **Reset_Password_Page**: Página frontend onde usuário define nova senha usando token
- **Rate_Limiter**: Middleware que limita número de requisições para prevenir abuso
- **Password_Hasher**: Componente que usa bcrypt para hash de senhas
- **Frontend_Router**: Vue Router que gerencia navegação entre páginas
- **Password_Validator**: Componente que valida força e confirmação de senha no frontend

## Requirements

### Requirement 1: Solicitar Recuperação de Senha

**User Story:** Como um usuário que esqueceu minha senha, eu quero solicitar uma recuperação de senha fornecendo meu email, para que eu possa receber um link de redefinição.

#### Acceptance Criteria

1. THE Forgot_Password_Endpoint SHALL aceitar requisições POST com campo email no body
2. WHEN um email válido e cadastrado é fornecido, THE Forgot_Password_Endpoint SHALL gerar um Recovery_Token único
3. WHEN um Recovery_Token é gerado, THE Token_Generator SHALL usar crypto.randomBytes com pelo menos 32 bytes de entropia
4. WHEN um Recovery_Token é gerado, THE Usuario_Model SHALL armazenar o token hasheado e timestamp de expiração
5. WHEN um Recovery_Token é armazenado, THE Forgot_Password_Endpoint SHALL definir expiração de 1 hora a partir do momento atual
6. WHEN um Recovery_Token é criado com sucesso, THE Email_Service SHALL enviar email com link contendo o token
7. WHEN um email não cadastrado é fornecido, THE Forgot_Password_Endpoint SHALL retornar resposta genérica de sucesso (para não revelar existência de contas)
8. THE Forgot_Password_Endpoint SHALL retornar status 200 com mensagem genérica independente de email existir ou não

### Requirement 2: Validar e Resetar Senha

**User Story:** Como um usuário com link de recuperação, eu quero definir uma nova senha usando o token recebido, para que eu possa recuperar acesso à minha conta.

#### Acceptance Criteria

1. THE Reset_Password_Endpoint SHALL aceitar requisições POST com campos token e novaSenha no body
2. WHEN um token é recebido, THE Token_Validator SHALL buscar usuário com token hasheado correspondente
3. WHEN um token é encontrado, THE Token_Validator SHALL verificar se o timestamp de expiração não foi ultrapassado
4. IF um token expirou, THEN THE Reset_Password_Endpoint SHALL retornar status 400 com mensagem "Token expirado"
5. IF um token é inválido ou não existe, THEN THE Reset_Password_Endpoint SHALL retornar status 400 com mensagem "Token inválido"
6. WHEN um token é válido e não expirado, THE Password_Hasher SHALL gerar hash bcrypt da nova senha com salt de 10 rounds
7. WHEN a nova senha é hasheada, THE Usuario_Model SHALL atualizar campo senha e remover campos de token de recuperação
8. WHEN a senha é atualizada com sucesso, THE Reset_Password_Endpoint SHALL retornar status 200 com mensagem de sucesso
9. WHEN a senha é atualizada, THE Reset_Password_Endpoint SHALL invalidar o token removendo-o do banco de dados

### Requirement 3: Armazenar Dados de Recuperação no Modelo Usuario

**User Story:** Como desenvolvedor do sistema, eu quero que o modelo Usuario armazene tokens de recuperação e timestamps, para que o sistema possa validar solicitações de reset.

#### Acceptance Criteria

1. THE Usuario_Model SHALL incluir campo resetPasswordToken do tipo String opcional
2. THE Usuario_Model SHALL incluir campo resetPasswordExpires do tipo Date opcional
3. THE Usuario_Model SHALL definir select: false para campo resetPasswordToken para não retorná-lo em queries padrão
4. WHEN um novo token é gerado, THE Usuario_Model SHALL sobrescrever qualquer token anterior existente
5. WHEN uma senha é resetada com sucesso, THE Usuario_Model SHALL remover valores de resetPasswordToken e resetPasswordExpires

### Requirement 4: Página Frontend de Solicitação de Recuperação

**User Story:** Como usuário que esqueceu minha senha, eu quero uma página onde posso inserir meu email, para que eu possa iniciar o processo de recuperação.

#### Acceptance Criteria

1. THE Forgot_Password_Page SHALL exibir formulário com campo de input para email
2. THE Forgot_Password_Page SHALL exibir botão "Enviar Link de Recuperação"
3. WHEN o formulário é submetido, THE Forgot_Password_Page SHALL validar formato de email antes de enviar requisição
4. WHEN a requisição é enviada, THE Forgot_Password_Page SHALL exibir estado de loading no botão
5. WHEN a requisição retorna sucesso, THE Forgot_Password_Page SHALL exibir mensagem "Se o email existir, você receberá um link de recuperação"
6. IF a requisição falha, THEN THE Forgot_Password_Page SHALL exibir mensagem de erro apropriada
7. THE Forgot_Password_Page SHALL incluir link "Voltar para Login" que redireciona para /login
8. THE Forgot_Password_Page SHALL ser responsiva para mobile, tablet e desktop

### Requirement 5: Página Frontend de Redefinição de Senha

**User Story:** Como usuário com link de recuperação, eu quero uma página onde posso definir minha nova senha, para que eu possa completar o processo de recuperação.

#### Acceptance Criteria

1. THE Reset_Password_Page SHALL extrair token da URL query parameter
2. THE Reset_Password_Page SHALL exibir formulário com campos "Nova Senha" e "Confirmar Senha"
3. THE Reset_Password_Page SHALL exibir indicador visual de força da senha enquanto usuário digita
4. WHEN o formulário é submetido, THE Password_Validator SHALL verificar que senha tem mínimo 6 caracteres
5. WHEN o formulário é submetido, THE Password_Validator SHALL verificar que senha e confirmação são idênticas
6. IF senhas não coincidem, THEN THE Reset_Password_Page SHALL exibir mensagem "As senhas não coincidem"
7. WHEN a requisição é enviada, THE Reset_Password_Page SHALL exibir estado de loading no botão
8. WHEN a requisição retorna sucesso, THE Reset_Password_Page SHALL exibir mensagem de sucesso e redirecionar para /login após 2 segundos
9. IF token é inválido ou expirado, THEN THE Reset_Password_Page SHALL exibir mensagem de erro específica
10. THE Reset_Password_Page SHALL ser responsiva para mobile, tablet e desktop

### Requirement 6: Roteamento Frontend

**User Story:** Como desenvolvedor do sistema, eu quero rotas configuradas para páginas de recuperação, para que usuários possam acessá-las via URLs específicas.

#### Acceptance Criteria

1. THE Frontend_Router SHALL incluir rota /forgot-password que renderiza Forgot_Password_Page
2. THE Frontend_Router SHALL incluir rota /reset-password que renderiza Reset_Password_Page
3. THE Frontend_Router SHALL configurar ambas rotas como públicas (sem autenticação requerida)
4. WHEN usuário acessa /reset-password sem token na URL, THE Reset_Password_Page SHALL exibir mensagem de erro

### Requirement 7: Segurança - Rate Limiting

**User Story:** Como administrador do sistema, eu quero limitar número de solicitações de recuperação, para prevenir abuso e ataques de força bruta.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limitar Forgot_Password_Endpoint a máximo 3 requisições por IP por hora
2. WHEN limite é excedido, THE Rate_Limiter SHALL retornar status 429 com mensagem "Muitas tentativas. Tente novamente mais tarde"
3. THE Rate_Limiter SHALL usar janela deslizante de 1 hora para contagem de requisições
4. THE Rate_Limiter SHALL aplicar limite por endereço IP do cliente

### Requirement 8: Segurança - Token Único e Não-Previsível

**User Story:** Como desenvolvedor de segurança, eu quero que tokens sejam criptograficamente seguros, para prevenir ataques de adivinhação.

#### Acceptance Criteria

1. THE Token_Generator SHALL usar crypto.randomBytes para gerar tokens
2. THE Token_Generator SHALL gerar tokens com mínimo 32 bytes (256 bits) de entropia
3. THE Token_Generator SHALL converter bytes para string hexadecimal para transmissão
4. THE Usuario_Model SHALL armazenar hash SHA-256 do token, não o token em texto plano
5. WHEN validando token, THE Token_Validator SHALL comparar hash do token recebido com hash armazenado

### Requirement 9: Integração com Email Service

**User Story:** Como usuário solicitando recuperação, eu quero receber email com link de recuperação, para que eu possa acessar página de reset.

#### Acceptance Criteria

1. WHEN Recovery_Token é gerado, THE Forgot_Password_Endpoint SHALL chamar Email_Service com email do usuário e token
2. THE Email_Service SHALL enviar email com assunto "Recuperação de Senha - MedConnect"
3. THE Email_Service SHALL incluir no corpo do email link no formato: http://localhost:5173/reset-password?token={token}
4. THE Email_Service SHALL incluir no email mensagem informando que link expira em 1 hora
5. THE Email_Service SHALL incluir no email aviso de que se usuário não solicitou recuperação, pode ignorar o email
6. IF Email_Service falha ao enviar, THEN THE Forgot_Password_Endpoint SHALL retornar status 500 com mensagem de erro

### Requirement 10: Feedback Visual e UX

**User Story:** Como usuário do sistema, eu quero feedback claro sobre o status das minhas ações, para que eu entenda o que está acontecendo.

#### Acceptance Criteria

1. WHEN qualquer formulário está sendo submetido, THE interface SHALL exibir indicador de loading
2. WHEN operação é bem-sucedida, THE interface SHALL exibir mensagem de sucesso em cor verde
3. WHEN operação falha, THE interface SHALL exibir mensagem de erro em cor vermelha
4. THE mensagens de feedback SHALL ser claras e específicas sobre o problema ou sucesso
5. WHEN senha é resetada com sucesso, THE Reset_Password_Page SHALL exibir contagem regressiva antes de redirecionar
6. THE formulários SHALL desabilitar botão de submit durante processamento para prevenir múltiplas submissões
7. THE campos de senha SHALL incluir botão de toggle para mostrar/ocultar senha

### Requirement 11: Validação de Entrada

**User Story:** Como desenvolvedor do sistema, eu quero validar todas as entradas de usuário, para prevenir erros e garantir integridade dos dados.

#### Acceptance Criteria

1. THE Forgot_Password_Endpoint SHALL validar que campo email está presente e não vazio
2. THE Forgot_Password_Endpoint SHALL validar formato de email usando regex
3. THE Reset_Password_Endpoint SHALL validar que campos token e novaSenha estão presentes
4. THE Reset_Password_Endpoint SHALL validar que novaSenha tem mínimo 6 caracteres
5. THE Password_Validator SHALL validar que senha contém pelo menos uma letra e um número
6. IF validação falha no backend, THEN THE endpoint SHALL retornar status 400 com mensagem descritiva
7. THE frontend SHALL realizar validação antes de enviar requisição para melhorar UX

### Requirement 12: Tratamento de Erros

**User Story:** Como usuário do sistema, eu quero mensagens de erro claras quando algo dá errado, para que eu saiba como proceder.

#### Acceptance Criteria

1. WHEN token não existe no banco, THE Reset_Password_Endpoint SHALL retornar "Token inválido ou expirado"
2. WHEN token expirou, THE Reset_Password_Endpoint SHALL retornar "Token expirado. Solicite nova recuperação"
3. WHEN email não está cadastrado, THE Forgot_Password_Endpoint SHALL retornar mensagem genérica (não revelar)
4. WHEN Email_Service falha, THE Forgot_Password_Endpoint SHALL retornar "Erro ao enviar email. Tente novamente"
5. WHEN erro de banco de dados ocorre, THE endpoints SHALL retornar status 500 com mensagem genérica
6. THE frontend SHALL capturar erros de rede e exibir mensagem "Erro de conexão. Verifique sua internet"
7. THE frontend SHALL exibir mensagens de erro por pelo menos 5 segundos antes de permitir nova tentativa
