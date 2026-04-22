import mongoose, { Document, Schema } from 'mongoose';

export interface IAgendamento extends Document {
  pacienteId: mongoose.Types.ObjectId;
  dataHora: Date;
  status: string;
  previsao: string;
}

const AgendamentoSchema: Schema = new Schema({
  pacienteId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do paciente é obrigatório'],
  },
  dataHora: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['AGENDADA', 'CANCELADA', 'CONCLUIDA'],
    default: 'AGENDADA',
  },
  previsao: {
    type: String,
  }
});

export default mongoose.model<IAgendamento>('Agendamento', AgendamentoSchema);
