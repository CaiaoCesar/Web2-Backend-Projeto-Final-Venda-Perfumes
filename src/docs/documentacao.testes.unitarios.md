# 🧪 Documentação de Testes Unitários

**Data:** 02 de Fevereiro de 2026
**Versão:** 3.1.0
**Status:** ✅ Completamente testado e aprovado

---

## 📊 Resumo Executivo

| Categoria      | Arquivo              | Testes | Foco                  | Status      |
| -------------- | -------------------- | ------ | --------------------- | ----------- |
| ⚠️ Edge Cases   | `edge-cases.test.js` | 33     | Lógica de Negócio     | ✅ 100%     |
| 🛡️ Validadores | `validators.test.js` | 40     | Schemas Zod           | ✅ 100%     |
| 📸 Upload      | `upload.test.js`     | 8      | Configuração Multer   | ✅ 100%     |
| **TOTAL** | **3 arquivos** | **81** | **Cobertura Crítica** | **✅ 100%** |

**Tempo de Execução Estimado:** ~5.5s
**Framework:** Vitest + Supertest + Express (Mock)
**Ambiente:** Isolado (sem banco de dados real)

---

## ⚠️ Edge Cases Críticos (33 testes)

### **1. Paginação - Cálculos Precisos**
- ✅ Primeira/última página e página do meio
- ✅ Total menor que limite
- ✅ Página maior que totalPages (banco retorna vazio)
- ✅ Cálculos com resto de divisão
- ✅ Skip correto para páginas altas
- ✅ Tratamento de total zero

### **2. Valores Monetários - Precisão**
- ✅ Preço positivo apenas (>0)
- ✅ Rejeita zero/negativo/Infinity/NaN
- ✅ Rejeita strings sem coerção automática

### **3. Estoque - Nunca Negativo**
- ✅ Adição/subtração válida
- ❌ Bloqueia operações que deixariam estoque negativo
- ✅ Valida apenas números inteiros
- ✅ Zero é permitido

### **4. Multi-tenancy - Duplicidade de Produtos**
- ✅ Mesmo vendedor: não pode duplicar nome
- ✅ Vendedores diferentes: podem ter produtos com mesmo nome
- ✅ Validação Case-insensitive

### **5. Validação de Frasco**
- ✅ Identifica tamanhos comuns (30, 50, 100ml...)
- ✅ Aceita tamanhos personalizados
- ❌ Rejeita Zero/negativo/Infinity

### **6. Unicidade de Loja (Simulação de Service)**
- ❌ Rejeita nome de loja exatamente igual
- ❌ Rejeita nome com diferença de Case (maiúscula/minúscula)
- ❌ Rejeita nome com espaços extras
- ✅ Aceita nome de loja novo
- ✅ Aceita nome parecido (ex: "Loja II")

---

## 🛡️ Validadores Zod (40 testes)

### **Perfume - Criação e Edição**
| Campo | Validações | Exemplos Bloqueados |
| :--- | :--- | :--- |
| **preco** | >0, número | -100, 0, "100abc" |
| **frasco** | >0, número | -50, 0 |
| **quantidade_estoque** | ≥0, inteiro | -10, 10.5 |
| **nome** | 3 chars min | "AB", "   " |
| **descricao** | ≥10 chars | "Curta" |
| **foto** | obrigatória | "" (vazia) |

**Comportamentos:**
- ✅ Coerção de Strings numéricas (`"299.90"` → `299.90`)
- ✅ Default: `quantidade_estoque` = 0 se omitido
- ✅ Trim automático em nomes e descrições

### **Estoque - Atualização**
- ✅ Aceita 0 e valores positivos
- ✅ Default = 0 se vazio
- ✅ Conversão de string para número
- ❌ Bloqueia negativos e decimais

### **Paginação - Listagem**
| Parâmetro | Valores Válidos | Default | Bloqueados |
| :--- | :--- | :--- | :--- |
| **page** | ≥1, inteiro | 1 | -1, 0, 1.5 |
| **limit** | 1-100 | 10 | -10, 0, 101 |

### **Vendedor - Cadastro (Regras Rígidas)**
| Campo | Regra | Exemplo Bloqueado |
| :--- | :--- | :--- |
| **email** | formato válido | `email-invalido` |
| **senha** | ≥8 caracteres | `1234567` |
| **telefone** | exatos 11 números | `319999abc99`, `31999` |
| **estado** | exatas 2 letras | `MGB`, `M1` |
| **cidade** | ≥2 caracteres | `A`, `` (vazia) |
| **nome_loja** | ≥5 caracteres | `Loja`, `` (vazia) |

- ✅ Conversão automática de estado para maiúsculo (`mg` → `MG`)

---

## 📸 Upload Middleware - Multer (8 testes)

Testes realizados simulando uma aplicação Express para validar o middleware de upload.

### **1. Tipos de Arquivo (MIME Types)**
- ✅ **Aceita:** PNG, JPEG/JPG, WEBP
- ❌ **Rejeita:** PDF, TXT, EXE (Executáveis)
- **Erro:** Retorna 400 com mensagem "Formato de arquivo inválido"

### **2. Limites de Tamanho**
- ✅ **Aceita:** Arquivos ≤ 5MB (Simulado com Buffer de 4MB)
- ❌ **Rejeita:** Arquivos > 5MB (Simulado com Buffer de 6MB)
- **Erro:** Retorna 400 com mensagem de limite excedido

---

## 🚀 Como Executar

```bash
# Executar todos os testes unitários
npm test unit

# Executar arquivos específicos
npx vitest run tests/unit/edge-cases.test.js
npx vitest run tests/unit/validators.test.js
npx vitest run tests/unit/upload.test.js

# Modo Watch (Desenvolvimento)
npm run test:unit:watch


## 👥 Responsáveis pelos Testes

| **Caio César**, **Jéferson Ramos**, **Matheus Jorge**

**Documentação Mantida por:** Equipe de Desenvolvimento  
**Última Atualização:** 02/02/2026

📚 **Documentação Relacionada:**  
[Testes de Integração](./documentacao.testes.integracao.md)