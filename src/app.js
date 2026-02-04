import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors'; // Captura automática de erros em funções assíncronas
import setupSwagger from './docs/swagger.js';

// Importação do middleware centralizado para tratamento de erros
import { errorHandler } from './middlewares/error.middleware.js';

// Importação das rotas de produtos e autenticação
import produtoRoutes from './routes/produto.routes.js';
import authRoutes from './routes/auth.routes.js';
// Rota de busca pública
import buscaRoutes from './routes/busca.routes.js';
import carrinhoRoutes from './routes/carrinho.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';

const app = express();

/**
 * Middlewares de Segurança e Base
 */
app.use(helmet()); // Reforço na segurança dos headers HTTP
app.use(cors()); // Permissão para acesso da API por outras origens (Frontend)
app.use(express.json()); // Suporte para leitura de dados em formato JSON

/**
 * Configuração de Limite de Requisições
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo de 15 minutos
  max: 100, // Limite máximo de 100 acessos por IP dentro do tempo definido
  message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
});
app.use('/api', limiter); // Aplicação do limite em todas as rotas prefixadas com /api

// Inicialização da interface interativa para testes da API
setupSwagger(app);


/**
 * Rotas Públicas e de Verificação
 */
app.get('/', (req, res) => {
  // Rota inicial com informações básicas e versão do sistema
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '3.1.0',
    endpoints: {
      auth: '/api/v2/vendedores',
      produtos: '/api/v2/perfumes',
    },
  });
});

app.get('/health', (req, res) => {
  // Verificação rápida do estado de saúde da aplicação e banco de dados
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Registro das rotas de autenticação e gestão de perfumes
app.use('/api/v2/vendedores', authRoutes);
app.use('/api/v2/perfumes', produtoRoutes);
app.use('/api/v2/buscas', buscaRoutes);
app.use('/api/v2/carrinho', carrinhoRoutes);
app.use('/api/v2/pedidos', pedidoRoutes);


// Middleware de Erro Global, formatação de qualquer 
// erro disparado pelos controllers ou middlewares anteriores.
app.use(errorHandler);

export default app;