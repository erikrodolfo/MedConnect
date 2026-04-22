import { Router } from 'express'
import { buscarEndereco } from '../controllers/cep.controller'

const router = Router()

router.get('/:cep', buscarEndereco)

export default router