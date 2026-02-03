// tests/integration/produtos.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import {
  criarVendedorTeste,
  gerarTokenTeste,
  criarPerfumeTeste,
  criarMultiplosPerfumes,
} from '../helpers/test-helpers.js';

// Este bloco organiza todos os testes de integração para as funcionalidades de perfumes
describe('Produtos - Testes de Integração', () => {
  // Declaração de variáveis globais para o escopo dos testes
  let vendedor, token;

  // Prepara o ambiente criando um vendedor e um token de acesso antes de cada teste
  beforeEach(async () => {
    // Inicializa o vendedor e o token antes de cada teste individual
    vendedor = await criarVendedorTeste();
    token = gerarTokenTeste(vendedor.id, vendedor.email);
  });

  // POST /api/v2/perfumes - Criar Perfume
  // Agrupa os testes de validação para a rota de criação de produtos
  describe('Criação de Perfumes', () => {
    // Verifica se o perfume é gravado corretamente no banco com dados e token válidos
    it('deve criar perfume com token válido', async () => {
      const novoPerfume = {
        nome: `Perfume Teste ${Date.now()}`,
        marca: 'Chanel',
        descricao: 'Fragrância elegante e marcante para ambiente de testes.',
        preco: 299.9,
        frasco: 100,
        quantidade_estoque: 50,
      };

      // Dados do perfume de teste
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', novoPerfume.nome)
        .field('marca', novoPerfume.marca)
        .field('descricao', novoPerfume.descricao)
        .field('preco', novoPerfume.preco)
        .field('frasco', novoPerfume.frasco)
        .field('quantidade_estoque', novoPerfume.quantidade_estoque)
        .field('foto', 'https://exemplo.com/foto.jpg') // Obrigatório pelo Zod
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(novoPerfume.nome);
    });

    // Testa se o sistema bloqueia o cadastro de perfumes sem o token de login
    it('deve rejeitar criação sem token', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .field('nome', 'Perfume Sem Auth')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token não fornecido');
    });

    // Impede que o mesmo vendedor cadastre dois perfumes com o nome igual
    it('deve rejeitar nome duplicado para o mesmo vendedor', async () => {
      const nomeDuplicado = `Perfume Duplicado ${Date.now()}`;

      await criarPerfumeTeste(vendedor.id, {
        nome: nomeDuplicado,
        descricao: 'Descrição válida com mais de dez caracteres.',
      });

      // Dados do perfume de teste
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', nomeDuplicado)
        .field('marca', 'Qualquer')
        .field('descricao', 'Descrição válida com mais de dez caracteres.')
        .field('preco', 100)
        .field('frasco', 100)
        .field('foto', 'https://exemplo.com/foto.jpg')
        .field('quantidade_estoque', 10)
        .expect(400);

      expect(response.body.message).toContain('já possui um perfume cadastrado com este nome');
    });

    // Confirma que vendedores diferentes podem usar o mesmo nome em seus perfumes
    it('deve permitir nomes iguais para vendedores diferentes', async () => {
      const nomeComum = `Perfume Comum ${Date.now()}`;

      await criarPerfumeTeste(vendedor.id, { nome: nomeComum });

      // Cria o 2º vendedor para teste
      const vendedor2 = await criarVendedorTeste();
      const token2 = gerarTokenTeste(vendedor2.id, vendedor2.email);

      //Dados do produto de teste
      const response2 = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token2}`)
        .field('nome', nomeComum)
        .field('marca', 'Marca Diferente')
        .field('descricao', 'Descrição válida com mais de dez caracteres.')
        .field('preco', 150)
        .field('frasco', 50)
        .field('quantidade_estoque', 30)
        .field('foto', 'https://exemplo.com/foto-v2.jpg')
        .expect(201);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.nome).toBe(nomeComum);
    });
  });

  // GET /api/v2/perfumes - Listar Perfumes
  // Testa a lógica de busca, filtros e privacidade dos dados
  describe('Listagem e Filtros', () => {
    // Garante que o usuário logado não veja os produtos de outros vendedores
    it('deve listar apenas perfumes do vendedor autenticado', async () => {
      await criarPerfumeTeste(vendedor.id, { nome: 'Meu Perfume A' });
      await criarPerfumeTeste(vendedor.id, { nome: 'Meu Perfume B' });

      const outroVendedor = await criarVendedorTeste();
      await criarPerfumeTeste(outroVendedor.id, { nome: 'Perfume de Outro' });

      const response = await request(app)
        .get('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.data.every((p) => p.nome !== 'Perfume de Outro')).toBe(true);
    });

    // Valida se o filtro de pesquisa por nome na URL está funcionando
    it('deve filtrar perfumes por nome', async () => {
      await criarPerfumeTeste(vendedor.id, { nome: 'Azzaro Pour Homme' });
      await criarPerfumeTeste(vendedor.id, { nome: 'Dior Sauvage' });

      const response = await request(app)
        .get('/api/v2/perfumes?nome=Azzaro')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.every((p) => p.nome.includes('Azzaro'))).toBe(true);
    });

    // Checa se a divisão de páginas e o limite de itens por página estão corretos
    it('deve paginar resultados corretamente', async () => {
      await criarMultiplosPerfumes(vendedor.id, 15);

      const response = await request(app)
        .get('/api/v2/perfumes?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.total).toBe(15);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  // PUT /api/v2/perfumes/:id - Atualizar Perfume
  // Valida as regras de edição de informações dos perfumes
  describe('Atualização de Perfumes', () => {
    // Testa o sucesso ao atualizar o nome de um perfume que pertence ao usuário logado
    it('deve atualizar perfume do próprio vendedor', async () => {
      const perfume = await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Nome Atualizado')
        .expect(200);

      expect(response.body.data.nome).toBe('Nome Atualizado');
    });

    // Bloqueia tentativas de alterar perfumes que pertencem a outros IDs de vendedor
    it('deve impedir atualização de perfume de outro vendedor', async () => {
      const outroVendedor = await criarVendedorTeste();
      const perfumeInvasor = await criarPerfumeTeste(outroVendedor.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfumeInvasor.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Tentativa de Invasão')
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });
  });

  // DELETE /api/v2/perfumes/:id - Deletar Perfume
  // Testa a remoção segura de produtos do banco de dados
  describe('Exclusão de Perfumes', () => {
    // Verifica se a exclusão funciona quando o vendedor é o dono real do perfume
    it('deve deletar perfume do próprio vendedor', async () => {
      const perfume = await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .delete(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    // Garante que um usuário não consiga excluir o estoque de terceiros
    it('deve impedir deleção de perfume de outro vendedor (404)', async () => {
      const outroVendedor = await criarVendedorTeste();
      const perfumeInvasor = await criarPerfumeTeste(outroVendedor.id);

      const response = await request(app)
        .delete(`/api/v2/perfumes/${perfumeInvasor.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });
  });
});