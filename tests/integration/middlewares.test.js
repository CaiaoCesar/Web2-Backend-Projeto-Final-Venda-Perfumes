// tests/integration/middlewares.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { criarVendedorTeste, gerarTokenTeste, criarPerfumeTeste } from '../helpers/test-helpers.js';

// Iniciamos o grupo de testes para validar se os middlewares e a segurança estão funcionando
describe('🛡️ Middlewares e Segurança - Testes de Integração', () => {
  // Criamos as variáveis globais para guardar o vendedor e o token de acesso nos testes
  let vendedor, token;

  // Antes de rodar cada teste individual, limpamos o cenário criando um vendedor e um token novo
  beforeEach(async () => {
    // Cria um vendedor de teste no banco de dados Neon
    vendedor = await criarVendedorTeste();
    // Gera um token JWT para esse vendedor conseguir acessar as rotas protegidas
    token = gerarTokenTeste(vendedor.id, vendedor.email);
  });

  // Grupo de testes focado no middleware que verifica se o usuário está logado
  describe('AuthMiddleware - Validação de Token', () => {
    // Verifica se o sistema barra o acesso quando o usuário não envia o token de segurança
    it('deve bloquear requisição sem header Authorization', async () => {
      // Faz uma chamada GET sem passar o cabeçalho de autorização
      const response = await request(app).get('/api/v2/perfumes').expect(401);

      // Confirma se a mensagem de erro avisa que o token não foi enviado
      expect(response.body.message).toContain('Token não fornecido');
    });

    // Testa se o sistema rejeita tokens que não começam com a palavra "Bearer"
    it('deve bloquear token malformado sem "Bearer" (401)', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes')
        // Envia o token de forma errada, sem o prefixo padrão
        .set('Authorization', 'token-sem-bearer')
        .expect(401);

      // Checa se o erro retornado explica que o formato do token está errado
      expect(response.body.message).toContain('Token malformado');
    });

    // Valida se o sistema identifica e bloqueia tokens que foram inventados ou já expiraram
    it('deve bloquear token inválido', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes')
        // Envia uma string qualquer no lugar de um token real
        .set('Authorization', 'Bearer token-inventado')
        .expect(401);

      // Verifica se a mensagem de erro é a que definimos para tokens sem validade
      expect(response.body.message).toContain('Token inválido ou expirado');
    });

    // Garante que o usuário consiga acessar a lista de perfumes quando o token está correto
    it('deve aceitar token válido no formato correto', async () => {
      // Cria um perfume vinculado ao vendedor para o teste ter o que listar
      await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .get('/api/v2/perfumes')
        // Passa o token legítimo gerado no beforeEach
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Confirma que a resposta deu certo
      expect(response.body).toHaveProperty('success', true);
    });
  });

  // Grupo de testes para o middleware que valida os IDs enviados na URL
  describe('ValidationMiddleware - Validação de Parâmetros', () => {
    // Impede que o sistema aceite letras onde deveria ser o número do ID do perfume
    it('deve rejeitar ID não numérico na URL', async () => {
      const response = await request(app)
        .put('/api/v2/perfumes/abc') // Passando "abc" no lugar do ID
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Teste')
        .expect(400);

      // Verifica se o erro aponta especificamente que o ID é inválido
      expect(response.body.message).toContain('ID inválido');
    });

    // Bloqueia IDs negativos, que não existem no nosso banco de dados
    it('deve rejeitar ID negativo', async () => {
      const response = await request(app)
        .put('/api/v2/perfumes/-5') // Passando "-5" no lugar do ID
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Teste')
        .expect(400);

      expect(response.body.message).toContain('ID inválido');
    });

    // Testa o fluxo normal de edição quando passamos um número de ID que existe
    it('deve aceitar ID numérico válido', async () => {
      // Cria um perfume para termos um ID real para editar
      const perfume = await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Nome Atualizado')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  // Grupo de testes que usa o Zod para validar os campos ao criar um perfume
  describe('Validação de Dados - Criação de Perfume', () => {
    // Barra a criação se o usuário esquecer de preencher os dados obrigatórios
    it('deve rejeitar criação sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        // Mandando apenas o nome, sem o restante das informações
        .field('nome', 'Apenas Nome')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    // Verifica se a regra de negócio impede preços menores que zero
    it('deve rejeitar preço negativo', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Perfume Teste')
        .field('marca', 'Marca')
        .field('descricao', 'Descrição')
        .field('preco', -50) // Preço inválido
        .field('frasco', 100)
        .field('quantidade_estoque', 10)
        .expect(400);

      // Confirma que o erro detalhado do Zod foi gerado
      expect(response.body.errors).toBeDefined();
    });

    // Garante que o estoque não possa ser um número negativo
    it('deve rejeitar quantidade de estoque negativa', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Perfume Teste')
        .field('marca', 'Marca')
        .field('descricao', 'Descrição')
        .field('preco', 100)
        .field('frasco', 100)
        .field('quantidade_estoque', -5) // Estoque inválido
        .expect(400);

      expect(response.body.message).toContain('Dados de cadastro inválidos');
      expect(response.body.errors).toBeDefined();
    });
  });

  // Grupo de testes de segurança para garantir que um vendedor não mexa no produto do outro
  describe('Segurança de Propriedade (Ownership)', () => {
    // Impede que um vendedor edite um perfume que não pertence a ele
    it('deve impedir edição de perfume de outro vendedor', async () => {
      // Criamos um segundo vendedor e um perfume para ele
      const vendedor2 = await criarVendedorTeste({
        email: `vendedor2-${Date.now()}@teste.com`,
      });
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      // Tentamos editar esse perfume usando o token do primeiro vendedor
      const response = await request(app)
        .put(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Tentativa de Hack')
        .expect(404); // Retorna 404 para não confirmar que o ID existe

      expect(response.body.message).toContain('não encontrado');
    });

    // Barra a tentativa de apagar perfumes de outros usuários
    it('deve impedir deleção de perfume de outro vendedor', async () => {
      const vendedor2 = await criarVendedorTeste({
        email: `vendedor2-delete-${Date.now()}@teste.com`,
      });
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      const response = await request(app)
        .delete(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });

    // Impede a alteração da quantidade em estoque de produtos de terceiros
    it('deve impedir atualização de estoque de outro vendedor', async () => {
      const vendedor2 = await criarVendedorTeste({
        email: `vendedor2-estoque-${Date.now()}@teste.com`,
      });
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/estoque/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantidade_estoque: 999 })
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });
  });
});