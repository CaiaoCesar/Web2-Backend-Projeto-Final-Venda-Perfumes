import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Vendas de Perfumes',
      version: '2.0.0',
      description: 'Backend para sistema de vendas de perfumes com checkout via WhatsApp',
      contact: {
        name: 'Alunos do Bsi Salinas',
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
    tags: [
      { name: 'Busca', description: 'Busca pública de perfumes' }, // Ficará em primeiro
      { name: 'Carrinho', description: 'Carrinho para compra' },   // Ficará em segundo
      { name: 'Pedidos', description: 'Gestão e criação de pedidos' },  // Ficará por terceiro
      { name: 'Vendedores', description: 'Criação de vendedores' },  // Ficará por quarto
      { name: 'Perfumes', description: 'Gestão e criação de perfumes' }  // Ficará por último
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT recebido no login',
        },
      },
    },
    // Define segurança global
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Vendas de Perfumes',
      swaggerOptions: {
        persistAuthorization: true, //  Mantém o token após refresh
      },
    })
  );

  console.log('\n📚 Swagger UI disponível em http://localhost:3000/api-docs\n');
};
