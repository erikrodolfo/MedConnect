import 'dotenv/config'; //carrega variáveis de ambiente (PRECISA SER A PRIMEIRA LINHA)
import express from 'express'; //framework para criar a api
import mongoose from 'mongoose'; //ODM para mongoDB
import cors from 'cors'; //permite requisições de outros domínios

//rotas da apliacação
import authRoutes from './routes/auth.routes';
import agendamentoRoutes from './routes/agendamento.routes';
import cepRouts from './routes/cep.routes';
import { verificarConexao } from './services/email.service';

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? [
      process.env.FRONTEND_URL, //url de produção
      'http://localhost:5173', //desenvolvimento
      'http://localhost:5174', //desenvolvimento alternativo
    ]
  : ['http://localhost:5173']; //fallback

app.use(
  cors({
    origin: allowedOrigins, //quais dominios podem fazer requisições
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], //métodos http permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], //cabeçalhos permitidos
    credentials: true, //Permite envios de cookies
  })
);

//middlewares
app.use(express.json()); //parseia body das requisições como JSON || sem isso o req.body seria undefined
app.use(express.urlencoded({ extended: true })); //parseia todos os dados de formulários

//health check
app.get('/health', (req, res) => {
  //rota para verficar se o servidor está funcionando
  res.json({
    status: 'ok',
    timeStamp: new Date().toISOString(),
    uptime: process.uptime(), //tempo que o servidor está rodando
    environment: process.env.NODE_ENV || 'development',
  });
});

//rotas da api
app.use('/auth', authRoutes); //todas as rotas do auth comecam com /auth
app.use('/agendamentos', agendamentoRoutes); //todas as rotas de agendamentos começam com /agendamento
app.use('/cep', cepRouts); //todas as rotas de CEp comecam com /cep

//rota 404 - não encontrada
app.use((req, res) => {
  //se nenhuma rota anterior respondeu, retorna 404
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

//tratamentos de erros global
app.use(
  //middleware de erro
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Erro:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

//conectar ao Mongo DB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinica')
  .then(() => {
    console.log('Conectado ao MongoDB');
    console.log(`Database: ${mongoose.connection.name}`);
  })

  .catch((err) => {
    console.log('Erro ao conectar', err);

    if (process.env.NODE_ENV === 'production') {
      // Em produção, encerra processo se não conectar ao banco
      process.exit(1);
    }
  });

//iniciar servidor
const PORT = process.env.PORT || 3000; //usa variável de ambiente ou 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

//tratamento de sinais
process.on('SIGTERM', () => {
  //quando receber sinal de encerramento (Ctrl+C. deply, etc)
  console.log('SINGTERM recebido. Encerrando gracefully...');

  mongoose.connection //Fecha conexão com MongoDB
    .close()
    .then(() => {
      console.log('MongoDB desconectado');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao desconectar MongoDB:', err);
      process.exit(1);
    });
});
