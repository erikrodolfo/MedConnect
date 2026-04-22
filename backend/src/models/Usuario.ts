import mongoose, { Document, Schema } from 'mongoose';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  role: string;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
}

const UsuarioSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Email inválido'],
  },

  senha: {
    type: String,
    required: [true, 'Senha é obrigatório'],
    minlength: 6,
    select: false,
  },
  logradouro: {
    type: String,
    required: [true, 'O logradouro é obrigatório'],
    trim: true,
    minlength: [3, 'Logradouro muito curto'],
  },
  numero: {
    type: String,
    required: [true, 'O número é obrigatório. Use S/N se não houver.'],
    trim: true,
  },
  bairro: {
    type: String,
    required: [true, 'O bairro é obrigatório'],
    trim: true,
  },
  cidade: {
    type: String,
    required: [true, 'A cidade é obrigatória'],
    trim: true,
    lowercase: true,
  },

  cep: {
    type: String,
    trim: true,
    match: [/^\d{5}-?\d{3}$/, 'CEP inválido'],
  },

  endereco: {
    type: String,
    trim: true,
    minlength: 5,
  },

  role: {
    type: String,
    enum: ['PACIENTE', 'SECRETARIO', 'ADMIN'],
    default: 'PACIENTE',
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
