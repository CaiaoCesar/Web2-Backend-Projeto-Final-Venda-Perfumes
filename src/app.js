import express from 'express';
import cors from 'cors';
import helmetConfig from './config/helmet.js';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { errorHandler } from './middlewares/error.middleware.js';
import produtoRoutes from './routes/produto.routes.js';
import authRoutes from './routes/auth.routes.js';
import buscaRoutes from './routes/busca.routes.js';
import carrinhoRoutes from './routes/carrinho.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import swaggerUi from 'swagger-ui-express';  
import swaggerSpec from './config/swagger.js';

const app = express();

/**
 * Middlewares de Segurança e Base
 */
app.use(helmetConfig); // Reforço na segurança dos headers HTTP
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
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Gerador de Provas - Documentação',
  }),
);

// Rota para baixar a especificação OpenAPI em JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Redireciona a rota raiz para o Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Rota de informações da API 
app.get('/info', (req, res) => {
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '3.2.1',
    endpoints: {
      auth: '/api/v2/vendedores',
      produtos: '/api/v2/perfumes',
      busca: '/api/v2/buscas',
      carrinho: '/api/v2/carrinho',
      checkout: '/api/v2/checkout',
    },
    documentation: '/api-docs',
  });
});

app.use('/api/v2/vendedores', authRoutes);
app.use('/api/v2/perfumes', produtoRoutes);
app.use('/api/v2/buscas', buscaRoutes);
app.use('/api/v2/carrinho', carrinhoRoutes);
app.use('/api/v2/pedidos', pedidoRoutes);

/**
 * Middleware de Erro Global
 */
app.use(errorHandler);

export default app;
