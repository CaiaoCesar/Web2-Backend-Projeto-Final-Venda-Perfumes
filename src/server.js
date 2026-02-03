import app from './app.js';
import dotenv from 'dotenv';
import helmetConfig from './config/helmet.js';

// Carregamento das variáveis de ambiente a partir do arquivo .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Aplicação das configurações de segurança nos headers HTTP via Helmet
app.use(helmetConfig);

// Inicialização do servidor para escutar requisições na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Link direto para facilitar o acesso inicial à rota de perfumes
  console.log(`Perfumes: http://localhost:${PORT}/api/v2/perfumes\n`);
});