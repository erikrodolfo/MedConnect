import { CustomRequest } from '../middlewares/auth.middleware';
import { Response } from 'express';
import Agendamento from '../models/Agendamento';
import { calcularHorariosLivres, realizarAgendamento }from '../services/agendamento.service';

//criar agendamento
export async function criarAgendamento(req: CustomRequest, res: Response) {
  try {
    const { dataHora } = req.body;
    const pacienteId = req.usuario.id;

    const agendamento = await realizarAgendamento(pacienteId, dataHora);

    return res.status(201).json(agendamento);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro no servidor';
    return res.status(400).json({ erro: mensagem });
  }
}


//listar Agendamento
export async function listarAgendamentos(req: CustomRequest, res: Response) {
  try {
    const usuarioId = req.usuario.id;
    const perfilUsuario = req.usuario.role;
    let query = {};
    if (perfilUsuario === 'PACIENTE') { //PACIENTE vê só o dele
      query = { pacienteId: usuarioId };
    }
    //ADMIN e SECRETÁRIO veem tudo
    const agendamentos = await Agendamento.find(query)
    .sort({ dataHora: -1 })
    .populate('pacienteId', 'nome')
    return res.status(200).json(agendamentos);
  } catch (erro) {
    return res.status(500).json({ erro: 'Falha interna ao buscar a agenda' });
  }
}

//cancelar agendamento
export async function cancelarAgendamento(req: CustomRequest, res: Response) {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const perfilUsuario = req.usuario.role;

    const agendamento = await Agendamento.findById(id);
    if (!agendamento)
      return res.status(404).json({ erro: 'Consulta não encontrada' });

    if (
      perfilUsuario === 'PACIENTE' &&
      agendamento.pacienteId.toString() !== usuarioId
    ) {
      return res.status(403).json({
        erro: 'Acesso negado. Você só pode cancelar as suas próprias consultas',
      });
    }

    const dataAtual = new Date();
    if (agendamento.dataHora < dataAtual) {
      return res
        .status(403)
        .json({ erro: 'Consultas passadas não podem ser canceladas' });
    }

    await Agendamento.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ mensagem: 'Consulta cancelada com sucesso.' });
  } catch (erro) {
    return res
      .status(500)
      .json({ erro: 'Falha interna ao tentar cancelar consulta' });
  }
}

//listar horários disponíveis
export async function listarHorariosDisponiveis(
  req: CustomRequest,
  res: Response
) {
  //variável com os dados extraídos
  //req = Abreviação de Request. É um objeto do Express que contém todos os detalhes da "carta" que o cliente enviou para o servidor (IP, cabeçalhos, corpo, etc.).
  //.query = É um objeto que armazena os parâmetros da Query String. Sabe quando a URL termina com ?data=2026-03-29? O query captura tudo o que vem depois da interrogação.
  // as string = Type Assertion (TypeScript): Aqui você está dizendo ao compilador: "Eu garanto que esse valor é uma string". Como o Express aceita arrays ou objetos na query, o TypeScript fica em dúvida. Isso "força" o tipo para evitar erros de compilação
  const dataString = req.query.data as string;

  if (!dataString) {
    return res.status(400).json({ erro: 'A data é obrigatória na URL' });
  }

  const horariosLivres = await calcularHorariosLivres(dataString)

  return res.status(200).json(horariosLivres);
}

//atualizar os status de agendamento
export async function atualizarStatusAgendamento(req: CustomRequest, res: Response) {
  const { id } = req.params
  const { status } = req.body
  try {
    //executa no banco e guarda a resposta
    const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
      id,
      { status: status},
      { new: true,  runValidators: true }
    )

    //valida se o ID realmente existia no banco
    if(!agendamentoAtualizado) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' })
    }
    //devolvendo o sucesso para o front-end
    return res.status(200).json(agendamentoAtualizado)
  } catch (erro) {
    console.error("Erro ao atualizar status: ", erro)
    return res.status(500).json({ erro: "falha interna no servidor" })
  }
}
