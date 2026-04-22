import Agendamento from "../models/Agendamento";
import Usuario from "../models/Usuario";
import { obterClima } from "./clima.service";


//calcular as horas livres para consulta
export async function calcularHorariosLivres(dataString: string) {
  const inicioDoDia = new Date(`${dataString}T00:00:00.000Z`);
  const fimDoDia = new Date(`${dataString}T23:59:59.999Z`);

  const horariosBase = [];

  for (let i = 540; i <= 1050; i += 30) {
    if (i >= 720 && i < 780) continue;

    let hora = Math.floor(i / 60);
    let minuto = i % 60;
    horariosBase.push(
      `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`
    );
  }

  const agendamentosOcupados = await Agendamento.find({
    dataHora: {
      $gte: inicioDoDia,
      $lte: fimDoDia,
    },
    status: { $ne: 'CANCELADA' },
  });

  const formatadorBR = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const horariosOcupados = agendamentosOcupados.map((agendamento) => {
    return formatadorBR.format(new Date(agendamento.dataHora));
  });

  const horariosLivres = horariosBase.filter((horario) => {
    return !horariosOcupados.includes(horario);
  });

  return horariosLivres
}

//realizar agendamento
export async function realizarAgendamento(pacienteId: string, dataHora: string) {

   // Validação de data
  const dataAgendada = new Date(dataHora);
  if (isNaN(dataAgendada.getTime())) throw new Error('Formato de data inválido.');
  if (dataAgendada < new Date()) throw new Error('Não é possível agendar no passado.');

  //validando o limte de data máxima
  const limiteMaximo = new Date()
  limiteMaximo.setDate(limiteMaximo.getDate() + 90)

  if(dataAgendada > limiteMaximo) {
    throw new Error('Não é possível agendar com mais de 90 dias de antecendência.')
  }


  // Validação de conflito
  const conflito = await Agendamento.findOne({
    pacienteId,
    dataHora,
    status: { $ne: 'CANCELADA' },
  });
  if (conflito) throw new Error('Horário indisponível');

  // Busca do paciente e clima
  const paciente = await Usuario.findById(pacienteId);
  if (!paciente || !paciente.cidade) throw new Error('Paciente ou Cidade inexistente');
  const clima = await obterClima(paciente.cidade, dataAgendada);

  console.log("CONTEUDO DO CLIMA", typeof clima, clima)

  //Criação
  return await Agendamento.create({
    pacienteId,
    dataHora,
    previsao: clima,
  });
}