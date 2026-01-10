# 📝 Padrões de Commits Semânticos

O commit semântico possui elementos estruturais (**tipos**) que informam a intenção do commit ao utilizador do código.

## 🎯 Tipos de Commits

### feat

**Descrição:** Commits do tipo `feat` indicam que o código está incluindo um novo recurso.  
**Relacionado com:** `MINOR` do versionamento semântico.

**Exemplo:**
feat: adiciona autenticação JWT para vendedores

yaml
Copy code

---

### fix

**Descrição:** Commits do tipo `fix` indicam a correção de um problema (bug fix).  
**Relacionado com:** `PATCH` do versionamento semântico.

**Exemplo:**
fix: corrige validação de email no cadastro

yaml
Copy code

---

### docs

**Descrição:** Commits do tipo `docs` indicam mudanças na documentação.  
**Não inclui:** Alterações em código.

**Exemplo:**
docs: atualiza README com instruções de instalação

yaml
Copy code
  
---

### test

**Descrição:** Commits do tipo `test` são utilizados quando há alterações em testes.  
**Inclui:** Criar, alterar ou excluir testes unitários.  
**Não inclui:** Alterações em código de produção.

**Exemplo:**
test: adiciona testes para o serviço de carrinho

yaml
Copy code

---

### build

**Descrição:** Commits do tipo `build` são utilizados para modificações em arquivos de build ou dependências.

**Exemplo:**
build: atualiza versão do Prisma para 5.x

yaml
Copy code

---

### perf

**Descrição:** Commits do tipo `perf` indicam alterações relacionadas à performance.

**Exemplo:**
perf: otimiza consulta de produtos com índices

yaml
Copy code

---

### style

**Descrição:** Commits do tipo `style` indicam alterações de formatação de código.  
**Inclui:** Ponto e vírgula, espaços em branco, lint, formatação.  
**Não inclui:** Alterações de funcionalidade.

**Exemplo:**
style: formata código conforme ESLint

yaml
Copy code

---

### refactor

**Descrição:** Commits do tipo `refactor` referem-se a refatorações que não alteram a funcionalidade.  
**Inclui:** Melhorias de performance e reorganização de código.

**Exemplo:**
refactor: reorganiza estrutura de pastas dos controllers

yaml
Copy code

---

### chore

**Descrição:** Commits do tipo `chore` indicam tarefas de manutenção, configurações ou pacotes.  
**Não inclui:** Alterações em código de funcionalidade.

**Exemplo:**
chore: adiciona .prettierrc ao gitignore

yaml
Copy code

---

### ci

**Descrição:** Commits do tipo `ci` indicam mudanças relacionadas à integração contínua.

**Exemplo:**
ci: configura GitHub Actions para deploy automático

yaml
Copy code

---

### raw

**Descrição:** Commits do tipo `raw` indicam mudanças em arquivos de configuração, dados ou parâmetros.

**Exemplo:**
raw: atualiza arquivo de configuração do banco

yaml
Copy code

---

### cleanup

**Descrição:** Commits do tipo `cleanup` são usados para remover código comentado ou desnecessário.  
**Objetivo:** Melhorar legibilidade e manutenibilidade.

**Exemplo:**
cleanup: remove código comentado obsoleto

yaml
Copy code

---

### remove

**Descrição:** Commits do tipo `remove` indicam a exclusão de arquivos, diretórios ou funcionalidades obsoletas.  
**Objetivo:** Reduzir tamanho e complexidade do projeto.

**Exemplo:**
remove: exclui feature deprecated de pagamento
