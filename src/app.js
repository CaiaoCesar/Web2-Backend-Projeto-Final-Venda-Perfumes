// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import setupSwagger from './docs/swagger.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
});
app.use('/api', limiter);

// Configurar Swagger
setupSwagger(app);

// Rotas da API com prefixo /api/versão
app.use('/api/v2/vendedores', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '2.0.0',
    docs: 'http://localhost:3000/api-docs',
    endpoints: {
      auth: '/api/v2/vendedores',
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Middleware de erro (deve vir por último)
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

export default app;
