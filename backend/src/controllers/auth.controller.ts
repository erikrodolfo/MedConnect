import express, { Request, response, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { CustomRequest } from '../middlewares/auth.middleware';
import validator from 'validator';
import crypto from 'crypto';
import { enviarEmailRecuperacao } from '../services/email.service';

export async function registro(req: Request, res: Response) {
  try {
    const { nome, email, senha, logradouro, numero, bairro, cidade, cep } =
      req.body; //extraindo os dados da requisição https
    const usuarioExistente = await Usuario.findOne({ email }); //verificando se o usuário já existe
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ erro: 'Já existe um cadastro com este Email.' });
    }

    //gerando o hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    //criando usuário com senha hasheada
    const usuarioHash = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      logradouro,
      numero,
      bairro,
      cidade,
      cep,
    });

    return res.status(201).json({
      nome: usuarioHash.nome,
      email: usuarioHash.email,
      logradouro: usuarioHash.logradouro,
      numero: usuarioHash.numero,
      bairro: usuarioHash.bairro,
      cidade: usuarioHash.cidade,
      cep: usuarioHash.cep,
      mensagem: 'USuario Cadastrado com sucesso!',
    });
  } catch (erro) {
    if (erro instanceof Error) {
      return res.status(400).json({ erro: erro.message });
    }

    return res.status(500).json({ erro: 'Erro desconhecido no servidor.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    //buscando o usuário pelo email
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email }).select('+senha'); //Por padrão, senha não vem na busca (segurança). o .select() força incluir
    if (!usuario) {
      return res.status(401).json({
        erro: 'Credenciais inválidas',
      });
    }
    //verificando se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        erro: 'Credenciais inválidas',
      });
    }
    //gerando o token jwt
    const token = jwt.sign(
      {
        id: usuario._id,
        role: usuario.role,
        nome: usuario.nome,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (erro) {
    if (erro instanceof Error) {
      return res.status(400).json({ erro: erro.message });
    }

    return res.status(500).json({ erro: 'Erro desconhecido no servidor.' });
  }
}

export const buscarPerfil = async (req: CustomRequest, res: Response) => {
  //extraindo dados que o middleware colocou na requisição
  const dadoUsuario = req.usuario;

  if (!dadoUsuario) {
    return res.status(400).json({ erro: 'Usuário não encontrado no token' });
  }

  return res.status(200).json(dadoUsuario);
};

//função recebe email, gera token, envia email
export const solicitarRecuperacao = async (
  req: CustomRequest,
  res: Response
) => {
  //extraindo email do usuario
  const { email } = req.body;

  //validando se o email está vazio
  if (!email) {
    return res.status(400).json({
      erro: 'Email é origatório',
    });
  }

  //validando se o email é válido
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      erro: 'Formato de email inválido',
    });
  }

  //buscando usuario com esse email no banco de dados
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.status(200).json({
      mensagem: 'Se o email existir, enviaremos um link de recuperação',
    });
  }

  //gerando um token com crypt randomByes com 32 bytes aleatório(256bits) e convertendo para hexadecimal (64 caracteres)
  const token = crypto.randomBytes(32).toString('hex');

  //hasheando o token com o hash SHA-256
  const tokenHash = crypto
    .createHash('sha256') //criando um objeto hash SHA-256
    .update(token) //adicionando um token para ser hasheado
    .digest('hex'); //finalizando e retornando um hash em hexadecimal

  usuario.resetPasswordToken = tokenHash; //salvando o token hash (o token não original)
  usuario.resetPasswordExpires = new Date(Date.now() + 3600000); //expira em 1h (3600000 ms)
  await usuario.save();

  await enviarEmailRecuperacao(usuario.email, token); //envia o token oroginal pois o usuário precisa do token original para acessar o link

  return res.status(200).json({
    mensagem: 'Se o email existir, você receberá um link de recuperação',
  });
};

//atualizar senha com novo hash
//remove o token (invalida para não ser reutilizado)
//remove a expiração
//salva no banco de dados
export const resetarSenha = async (req: CustomRequest, res: Response) => {
  try {
    //extraindo dados do body
    //token vem da url que o usuário clicou no email
    //novaSenha vem do formulário que o usuário preencheu
    const { token, novaSenha } = req.body;

    //virificando se o token foi enviado
    if (!token) {
      return res.status(400).json({
        erro: 'Token é obrigatório',
      });
    }
    //verificando se a nova senha foi enviada
    if (!novaSenha) {
      return res.status(400).json({
        erro: 'A nova senha é obrigatória',
      });
    }

    //verificando o tamanho mínimo da senha
    if (novaSenha.length < 6) {
      return res.status(400).json({
        erro: 'A senha precisa ter no mínimo 6 caracteres',
      });
    }

    //criando hash SHA256 co token recebido pois o token no banco está hasheado, então precisa hashear o token recebido para comparar
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    //buscando usuário com token válido e não expirado
    const usuario = await Usuario.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }, //expiração maior que agora
    });

    //verificando se o encontrou o usuario
    if (!usuario) {
      return res.status(400).json({
        erro: 'Token inválido ou expirado', //possíveis motivos: o token:não existe no banco || token expirou || token já foi usado e removido
      });
    }

    //gerando hash bcrypt da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    //atualizando a senha e removendo token
    usuario.senha = senhaHash;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso!',
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        erro: error.message,
      });
    }

    return res.status(500).json({
      erro: 'Erro desconhecido no servidor',
    });
  }
};
