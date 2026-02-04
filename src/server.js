import app from './app.js';
import dotenv from 'dotenv';
import helmetConfig from './config/helmet.js';

// Carregamento das variáveis de ambiente a partir do arquivo .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Inicialização do servidor para escutar requisições na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}\n`);
});