import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Vendas de Perfumes',
      version: '3.2.1',
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
        url: 'https://web2-backend-projeto-final-venda-pe.vercel.app/',
        description: 'Servidor de produção',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;