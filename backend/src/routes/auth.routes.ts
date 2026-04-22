import { Router } from "express";
import { registro, login } from "../controllers/auth.controller";
import { buscarPerfil } from "../controllers/auth.controller";
import { autenticarToken } from "../middlewares/auth.middleware";
import { resetarSenha } from "../controllers/auth.controller";
import { solicitarRecuperacao } from "../controllers/auth.controller";

const router = Router()

router.post('/registro', registro)
router.post('/login', login)
router.get('/perfil', autenticarToken, buscarPerfil)
router.post('/reset-password', resetarSenha)
router.post('/forgot-password', solicitarRecuperacao)

export default router