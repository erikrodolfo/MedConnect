import { Router } from 'express';
import {
  cancelarAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarHorariosDisponiveis,
  atualizarStatusAgendamento,
} from '../controllers/agendamento.controller';
import { autenticarToken, verificarAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', autenticarToken, criarAgendamento);
router.get('/', autenticarToken, listarAgendamentos);
router.patch('/:id/status', autenticarToken, verificarAdmin, atualizarStatusAgendamento);
router.delete('/:id', autenticarToken, cancelarAgendamento);
router.get('/disponiveis', listarHorariosDisponiveis);

export default router;
