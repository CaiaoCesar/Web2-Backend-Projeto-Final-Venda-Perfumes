# Web2-Backend-Projeto-Final-Venda-Perfumes

Repositório para a atividade do Projeto de Trabalho Final da Disciplina de Web 2.

# Documentação das Branches - Sistema de Vendas de Perfumes

## 📋 Estrutura de Branches

### 🏗️ Branches Principais

#### `main` (Produção)

- **Finalidade:** Contém apenas código pronto para produção
- **Quem usa:** Todos, mas somente para deploy, ou seja depois da feature estar na sua branch, ir pra `develop` e só depois vir pra cá.
- **Regras:**
  - Só aceita merges de `develop` via Pull Request
  - Nunca commitar diretamente
  - Deploy automático para produção (se configurado)

#### `develop` (Desenvolvimento)

- **Finalidade:** Branch de integração de todas as features (antes de ir pra main)
- **Quem usa:** Todos os desenvolvedores
- **Regras:**
  - Branch base para criar novas features
  - Integração contínua de todas as funcionalidades
  - Ambiente de staging/testes

---

### 🔧 Branches de Features

#### `feature/auth-vendedor`

- **Responsável:** Dev 1
- **Funcionalidades:**
  - Cadastro de vendedor (nome, email, senha, telefone)
  - Login/logout de vendedor
  - Autenticação JWT
  - Middleware de autenticação
  - Recuperação de senha
- **Dependências:** Nenhuma (feature independente)

#### `feature/crud-produtos`

- **Responsável:** Dev 2
- **Funcionalidades:**
  - CRUD completo de perfumes
  - Campos: nome, marca, descrição, preço, estoque, imagens, categoria
  - Upload de imagens dos perfumes
  - Validações de preço e estoque
- **Dependências:** `feature/auth-vendedor` (para proteger rotas)

#### `feature/busca-produtos`

- **Responsável:** Dev 3
- **Funcionalidades:**
  - Busca de perfumes por nome e marca. OBS: Só aparece perfumes da localização do cliente.
  - Filtros: preço.
  - Ordenação: preço.
  - Paginação de resultados
- **Dependências:** `feature/crud-produtos` (precisa dos produtos criados)

#### `feature/carrinho-compras-produtos`

- **Responsável:** Dev 3 (pode ser compartilhado)
- **Funcionalidades:**
  - Adicionar/remover produtos do carrinho
  - Quantidade por item
  - Calcular total do carrinho
  - Salvar carrinho temporário (session/local storage)
  - Visualizar carrinho
- **Dependências:** `feature/busca-produtos` (para pegar produtos)

#### `feature/checkout-whatsapp`

- **Responsável:** Dev 4
- **Funcionalidades:**
  - Captura do número de telefone e nome do cliente
  - Formatação do número para link do WhatsApp
  - Geração da mensagem com produtos do carrinho
  - Redirecionamento para WhatsApp com mensagem pré-preenchida
  - Validação do número de telefone
- **Dependências:** `feature/carrinho-compras-produtos` (para pegar itens)

#### `feature/pedidos-status`

- **Responsável:** Dev 5
- **Funcionalidades:**
  - Criar pedido ao finalizar checkout
  - O pedido tem que aparecer para o vendedor
  - Model de pedido com status (pendente, confirmado)
- **Dependências:** `feature/auth-vendedor` + `feature/checkout-whatsapp`

---

## 🚀 Fluxo de Trabalho

### Pré-requisitos

- Node.js 18+
- PostgreSQL (Neon)
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale dependências:
   ```bash
   npm install
   ```

### 1. Iniciar uma Nova Feature

```bash
# Atualizar develop
git checkout develop
git pull origin develop

# Criar branch da feature
git checkout -b feature/nome-da-feature

# Trabalhar na feature...
```

### 2. Commits Semânticos

```bash
feat: adiciona login do vendedor
fix: corrige validação de email no cadastro
docs: atualiza README com instruções de instalação
style: formata código conforme eslint
refactor: melhora estrutura do service de produtos
test: adiciona testes para carrinho
```

### 3. Finalizar Feature

```bash
# Commitar mudanças
git add .
git commit -m "feat: adiciona funcionalidade X"

# Enviar para repositório remoto
git push origin feature/nome-da-feature

# Criar Pull Request no GitHub para `develop`
```

### 4. Code Review

- Cada PR precisa de pelo menos 1 aprovação
- Testar localmente antes de aprovar
- Verificar conflitos com `develop`

### 5. Merge para Develop

```bash
# Após PR aprovado, fazer merge
git checkout develop
git pull origin develop
git merge --no-ff feature/nome-da-feature
git push origin develop

# Deletar branch local e remota
git branch -d feature/nome-da-feature
git push origin --delete feature/nome-da-feature
```

---

## 📊 Ordem de Implementação Sugerida

### Fase 1: Fundação (Sprint 1)

1. `feature/auth-vendedor` ✅
2. `feature/crud-produtos` ✅
3. Configuração do banco de dados

### Fase 2: Experiência do Cliente (Sprint 2)

4. `feature/busca-produtos` ✅
5. `feature/carrinho-compras-produtos` ✅

### Fase 3: Finalização (Sprint 3)

6. `feature/checkout-whatsapp` ✅
7. `feature/pedidos-status` ✅

---

## ⚠️ Regras Importantes

### NUNCA faça:

- Commitar diretamente em `main` ou `develop`
- Merge sem Pull Request
- Trabalhar na branch de outro dev sem comunicação
- Deixar branches órfãs após o merge

### SEMPRE faça:

- Atualizar sua branch com `develop` regularmente
- Escrever commits descritivos
- Testar antes de criar PR
- Revisar código dos colegas
- Documentar endpoints e funcionalidades

---

## 🔗 Dependências entre Branches

```
auth-vendedor
    ↓
crud-produtos
    ↓
busca-produtos → carrinho-compras
                    ↓
            checkout-whatsapp
                    ↓
               pedidos-status
```

---

## 📞 Comunicação entre Devs

Devs com dependências devem:

1. Comunicar quando sua feature estiver estável
2. Compartilhar models/endpoints que serão usados
3. Fazer reuniões de sincronização quando necessário
