import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import agendamentoRoutes from './routes/agendamento.routes'
import cepRouts from './routes/cep.routes'
import { verificarConexao } from './services/email.service'

const app = express()
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/agendamentos', agendamentoRoutes)
app.use('/cep', cepRouts)

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinica')
.then(() => {
    console.log("Conectado ao MongoDB")
})

.catch (err => {
    console.log("Erro ao conectar", err)
})

app.listen(3000, () => {
    console.log("O servidor está rodando na porta 3000")
})