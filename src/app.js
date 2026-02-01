import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors'; // Garante que erros em funções async sejam capturados
import setupSwagger from './docs/swagger.js';

// Importação do seu middleware padronizado
import { errorHandler } from './middlewares/error.middleware.js';

// Importação das rotas
import produtoRoutes from './routes/produto.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

/**
 * Middlewares de Segurança e Base
 */
app.use(helmet()); // Proteção de headers HTTP
app.use(cors()); // Gerenciamento de acessos externos
app.use(express.json()); // Permite receber JSON no corpo das requisições

/**
 * Configuração de Limite de Requisições (Rate Limiting)
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
});
app.use('/api', limiter);

/**
 * Documentação Swagger
 */
setupSwagger(app);

/**
 * Rotas Públicas e de Verificação
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v2/vendedores',
      produtos: '/api/v2/perfumes',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected', 
  });
});

/**
 * Rotas da API (Prefixadas com /api/v2)
 */
app.use('/api/v2/vendedores', authRoutes);
app.use('/api/v2/perfumes', produtoRoutes);

/**
 * Middleware de Erro Global
 * OBRIGATORIAMENTE DEVE SER A ÚLTIMA LINHA ANTES DO EXPORT.
 * Ele capturará todos os 'next(error)' enviados pelos controllers.
 */
app.use(errorHandler);

export default app;