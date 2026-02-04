# 📂 Estrutura do Projeto

```text
├── src/
│   ├── config/
│   │   ├── database.js        # Configuração do Prisma/Neon
│   │   ├── upload.js          # Configuração de upload de arquivos
│   │   └── helmet.js          # Configuração de segurança dos headers
│   │
│   ├── controllers/
│   │   ├── auth.controller.js      # Autenticação do vendedor
│   │   ├── produto.controller.js   # CRUD de perfumes
│   │   ├── busca.controller.js     # Busca de perfumes
│   │   ├── carrinho.controller.js  # Carrinho de compras
│   │   ├── pedido.controller.js    # Pedidos e status
│   │   └── checkout.controller.js  # Checkout WhatsApp
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # Middleware de autenticação
│   │   ├── validation.middleware.js # Validação de dados
│   │   ├── error.middleware.js      # Tratamento de erros
│   │
│   ├── services/
│   │   ├── auth.service.js      # Lógica de autenticação
│   │   ├── produto.service.js   # Lógica de produtos
│   │   ├── busca.service.js     # Lógica de busca
│   │   ├── carrinho.service.js  # Lógica do carrinho
│   │   ├── pedido.service.js    # Lógica de pedidos
│   │   └── upload.service.js    # Lógica de upload de imagens
│   │
│   ├── routes/
│   │   ├── auth.routes.js       # Rotas de autenticação
│   │   ├── produto.routes.js    # Rotas de produtos
│   │   ├── busca.routes.js      # Rotas de busca
│   │   ├── pedido.routes.js     # Rotas de pedidos
│   │   └── carrinho.routes.js   # Rotas de carrinho
│   │
│   ├── utils/
│   │   ├── appError.js   # Centralização de erros personalizados
│   │   ├── whatsapp.js     # Geração de link WhatsApp   
│   │
├── tests/
│   │   ├── unit/ # Testes unitários 
│   │   └── integration/ # Testes de integração
|   |   └── setup/*  # Configuração dos testes
│   │
│   ├── schemas/        # Validações Zod
│   │
│   │
│   │
│   ├── docs/     
│   │   ├── estrutura.md        # Organização de arquivos do projeto
│   │   ├── documentacao.*      # Documentação dos testes de integração e unitários
│   │   ├── padroes.commit.md   # Padrões de commit usados
│   │   └── swagger.js          # Documentação da API via Swagger
│   │
│   ├── app.js      # Configuração do Express
│   └── server.js   # Ponto de entrada
│
├── node_modules/   # Dependências instaladas (não commitado)
│
├── prisma/
│   ├── schema.prisma   # Schema do banco de dados
│   └── migrations/    # Migrations geradas
│
│
├── .env               # Variáveis de ambiente (não commitado)
├── .env.example       # Exemplo de variáveis de ambiente
├── .env.test          # Variáveis de ambiente para testes
├── .env.test.example  # Exemplo de variáveis de ambiente usadas nos testes
├── .gitignore         # Arquivos ignorados pelo Git
├── eslint.config.js   # Configuração do ESLint
├── LICENSE            # Licença MIT
├── package.json       # Dependências do projeto
├── package-lock.json  # Lock das dependências
├── .prettierrc        # Configuração do Prettier
├── README.md          # Documentação principal
├── vercel.json        # Configuração do Deploy na Vercel
└── vitest.config.js   # Configuração dos testes
```
