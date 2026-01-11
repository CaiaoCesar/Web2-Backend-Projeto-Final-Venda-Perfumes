import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Vendas de Perfumes',
      version: '1.0.0',
      description: 'Backend para sistema de vendas de perfumes com checkout via WhatsApp',
      contact: {
        name: 'Sua Equipe',
        email: 'equipe@email.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api-seu-projeto.vercel.com/api',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer {token}',
        },
      },
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Rotas de autenticação de vendedores',
      },
      {
        name: 'Produtos',
        description: 'Rotas para gerenciamento de perfumes',
      },
      {
        name: 'Pedidos',
        description: 'Rotas para gerenciamento de pedidos',
      },
      {
        name: 'Checkout',
        description: 'Rotas para finalização de compra via WhatsApp',
      },
    ],
  },
  apis: [
    './src/routes/*.js',          // Rotas com anotações
    './src/docs/schemas/*.js',    // Schemas reutilizáveis
  ],
};

const specs = swaggerJsdoc(options);

export default (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Vendas de Perfumes",
  }));
  
  console.log('\n📚 Swagger UI disponível em http://localhost:3000/api-docs');
};