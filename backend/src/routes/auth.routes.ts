import { Router } from 'express';
import {
  registro,
  login,
  buscarPerfil,
  resetarSenha,
  solicitarRecuperacao,
  atualizarFotoPerfil,
  removerFotoPerfil
} from '../controllers/auth.controller';
import { autenticarToken } from '../middlewares/auth.middleware';
import upload from '../config/upload';

const router = Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', autenticarToken, buscarPerfil);
router.post('/reset-password', resetarSenha);
router.post('/forgot-password', solicitarRecuperacao);
router.patch(
  '/perfil/foto',
  autenticarToken,
  upload.single('fotoPerfil'),
  atualizarFotoPerfil
);
router.delete('/perfil/foto', autenticarToken, removerFotoPerfil);


export default router;
