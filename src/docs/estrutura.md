# 📂 Estrutura do Projeto

```text
├── src/
│   ├── config/
│   │   ├── database.js        # Configuração do Prisma/Neon
│   │   ├── upload.js          # Configuração de upload de arquivos
│   │   └── jwt.js             # Configuração JWT
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
│   │   └── upload.middleware.js     # Middleware de upload
│   │
│   ├── services/
│   │   ├── auth.service.js      # Lógica de autenticação
│   │   ├── produto.service.js   # Lógica de produtos
│   │   ├── busca.service.js     # Lógica de busca
│   │   ├── carrinho.service.js  # Lógica do carrinho
│   │   ├── pedido.service.js    # Lógica de pedidos
│   │   ├── checkout.service.js  # Lógica de checkout / WhatsApp
│   │   └── upload.service.js    # Lógica de upload de imagens
│   │
│   ├── routes/
│   │   ├── auth.routes.js       # Rotas de autenticação
│   │   ├── produto.routes.js    # Rotas de produtos
│   │   ├── public.routes.js     # Rotas públicas (busca, carrinho)
│   │   ├── pedido.routes.js     # Rotas de pedidos
│   │   └── checkout.routes.js   # Rotas de checkout
│   │
│   ├── utils/
│   │   ├── validators.js   # Funções de validação
│   │   ├── helpers.js      # Funções auxiliares
│   │   ├── whatsapp.js     # Geração de link WhatsApp
│   │   └── pagination.js   # Funções de paginação
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── auth.test.js
│   │   │   ├── produto.test.js
│   │   │   └── pedido.test.js
│   │   └── integration/
│   │       ├── routes.test.js
│   │       └── database.test.js
│   │
│   ├── docs/
│   │   ├── estrutura.md        # Organização de arquivos do projeto
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
├── uploads/
│   └── perfumes/      # Upload de imagens
│
├── .env               # Variáveis de ambiente (não commitado)
├── .env.example       # Exemplo de variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo Git
├── eslint.config.js   # Configuração do ESLint
├── LICENSE            # Licença MIT
├── package.json       # Dependências do projeto
├── package-lock.json  # Lock das dependências
├── .prettierrc        # Configuração do Prettier
├── README.md          # Documentação principal
└── vitest.config.js   # Configuração dos testes