import express from 'express';
import cors from 'cors';
import helmetConfig from './config/helmet.js';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { errorHandler } from './middlewares/error.middleware.js';

// Rotas
import produtoRoutes from './routes/produto.routes.js';
import authRoutes from './routes/auth.routes.js';
import buscaRoutes from './routes/busca.routes.js';
import carrinhoRoutes from './routes/carrinho.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';

// Swagger Imports
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js'; 

const app = express();

// --- 1. Segurança e Parsers ---
app.use(helmetConfig);
app.use(cors());
app.use(express.json());

// --- 2. Rate Limit ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Muitas requisições deste IP.',
});
app.use('/api', limiter);

// --- 3. Configuração do Swagger ---
// (Removida a linha setupSwagger(app) que causaria erro)
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Vendas - Documentação',
    // Adicione as linhas abaixo para corrigir o erro de MIME type na Vercel
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  })
);

// Rota para Debug do Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- 4. Rotas da Aplicação ---
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '3.1.0',
    endpoints: {
      auth: '/api/v2/vendedores',
      produtos: '/api/v2/perfumes',
      busca: '/api/v2/buscas',
      carrinho: '/api/v2/carrinho',
      pedidos: '/api/v2/pedidos',
      docs: '/api-docs',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Rota de Informações
app.get('/info', (req, res) => {
  res.json({
    message: 'API Sistema de Vendas de Perfumes',
    status: 'online',
    version: '3.3.0',
    endpoints: {
      auth: '/api/v2/vendedores',
      produtos: '/api/v2/perfumes',
      busca: '/api/v2/buscas',
      carrinho: '/api/v2/carrinho',
      pedidos: '/api/v2/pedidos',
    },
    documentation: '/api-docs',
  });
});

app.use('/api/v2/vendedores', authRoutes);
app.use('/api/v2/perfumes', produtoRoutes);
app.use('/api/v2/buscas', buscaRoutes);
app.use('/api/v2/carrinho', carrinhoRoutes);
app.use('/api/v2/pedidos', pedidoRoutes);

// --- 5. Tratamento de Erros ---
app.use(errorHandler);

export default app;