import nodemailer from 'nodemailer';



// Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar conexão
export const verificarConexao = async () => {
  try {
    await transporter.verify();
    console.log('O servidor está pronto para enviar mensagens');
  } catch (erro) {
    console.error('Erro na Verificação', erro);
  }
};

//Enviar email de recuperação
export const enviarEmailRecuperacao = async (email: string, token: string) => {
  try {
    //Montando link
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Enviando o email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email, 
      subject: 'Recuperação de Senha - MedConnect',
      text: `Recuperação de Senha - MedConnect

Você solicitou a recuperação de senha.
Acesse o link abaixo para redefinir:

${link}

Este link expira em 1 hora.
Se você não solicitou, ignore este email.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Recuperação de Senha</h2>
  <p>Olá,</p>
  <p>Você solicitou a recuperação de senha da sua conta MedConnect.</p>
  <p>Clique no botão abaixo para redefinir sua senha:</p>
  <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Redefinir Senha
  </a>
  <p><strong>Este link expira em 1 hora.</strong></p>
  <p>Se você não solicitou esta recuperação, ignore este email.</p>
</div>`,
    });

    console.log('Email enviado com sucesso:', info.messageId);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    throw new Error('Falha ao enviar email de recuperação');
  }
};
