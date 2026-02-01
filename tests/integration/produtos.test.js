// tests/integration/produtos.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { 
  criarVendedorTeste, 
  gerarTokenTeste, 
  criarPerfumeTeste,
  criarMultiplosPerfumes
} from '../helpers/test-helpers.js';
import prisma from '../../src/config/database.js';

describe('🧴 Produtos - Testes de Integração', () => {
  
  let vendedor1, vendedor2, token1, token2;

  beforeEach(async () => {
    vendedor1 = await criarVendedorTeste({ 
      email: `vendedor1-${Date.now()}@teste.com` 
    });
    vendedor2 = await criarVendedorTeste({ 
      email: `vendedor2-${Date.now()}@teste.com` 
    });

    token1 = gerarTokenTeste(vendedor1.id, vendedor1.email);
    token2 = gerarTokenTeste(vendedor2.id, vendedor2.email);
  });

  describe('POST /api/v2/perfumes - Criar Perfume', () => {
    
    it('deve criar perfume com token válido (201)', async () => {
      const novoPerfume = {
        nome: 'Dior Sauvage',
        marca: 'Dior',
        descricao: 'Perfume masculino amadeirado',
        preco: 450.00,
        frasco: 100.0,
        quantidade_estoque: 30,
        foto: 'https://exemplo.com/dior-sauvage.jpg',
      };

      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token1}`)
        .field('nome', novoPerfume.nome)
        .field('marca', novoPerfume.marca)
        .field('descricao', novoPerfume.descricao)
        .field('preco', novoPerfume.preco)
        .field('frasco', novoPerfume.frasco)
        .field('quantidade_estoque', novoPerfume.quantidade_estoque)
        .field('foto', novoPerfume.foto) // ← ADICIONADO
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(novoPerfume.nome);
      expect(response.body.data.vendedorId).toBe(vendedor1.id);
    });

    it('deve rejeitar criação sem token (401)', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .field('nome', 'Perfume Sem Auth')
        .field('marca', 'Marca')
        .field('preco', 100)
        .field('foto', 'https://exemplo.com/foto.jpg')
        .expect(401);

      expect(response.body.message).toContain('Token não fornecido');
    });

    it('deve rejeitar nome duplicado para o mesmo vendedor (400)', async () => {
      const nomeDuplicado = 'Chanel No 5';

      await criarPerfumeTeste(vendedor1.id, { nome: nomeDuplicado });

      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token1}`)
        .field('nome', nomeDuplicado)
        .field('marca', 'Chanel')
        .field('descricao', 'Perfume clássico')
        .field('preco', 500)
        .field('frasco', 100)
        .field('quantidade_estoque', 10)
        .field('foto', 'https://exemplo.com/chanel.jpg') // ← ADICIONADO
        .expect(400);

      expect(response.body.message).toContain('já possui um perfume cadastrado com este nome');
    });

    it('deve permitir nomes iguais para vendedores diferentes', async () => {
      const nomeComum = 'Perfume Popular';

      // Vendedor 1
      await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token1}`)
        .field('nome', nomeComum)
        .field('marca', 'Marca A')
        .field('descricao', 'Descrição A')
        .field('preco', 100)
        .field('frasco', 50)
        .field('quantidade_estoque', 20)
        .field('foto', 'https://exemplo.com/foto-a.jpg') // ← ADICIONADO
        .expect(201);

      // Vendedor 2
      const response2 = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token2}`)
        .field('nome', nomeComum)
        .field('marca', 'Marca B')
        .field('descricao', 'Descrição B')
        .field('preco', 150)
        .field('frasco', 75)
        .field('quantidade_estoque', 15)
        .field('foto', 'https://exemplo.com/foto-b.jpg') // ← ADICIONADO
        .expect(201);

      expect(response2.body.data.vendedorId).toBe(vendedor2.id);
    });
  });

  describe('GET /api/v2/perfumes - Listar Perfumes', () => {
    
    it('deve listar apenas perfumes do vendedor autenticado (200)', async () => {
      await criarPerfumeTeste(vendedor1.id, { nome: 'Perfume V1-1' });
      await criarPerfumeTeste(vendedor1.id, { nome: 'Perfume V1-2' });
      await criarPerfumeTeste(vendedor2.id, { nome: 'Perfume V2-1' });

      const response = await request(app)
        .get('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      
      response.body.data.forEach(perfume => {
        expect(perfume.nome).toContain('V1');
      });
    });

    it('deve filtrar perfumes por nome (200)', async () => {
      await criarPerfumeTeste(vendedor1.id, { nome: 'Dior Sauvage' });
      await criarPerfumeTeste(vendedor1.id, { nome: 'Chanel No 5' });
      await criarPerfumeTeste(vendedor1.id, { nome: 'Dior Homme' });

      const response = await request(app)
        .get('/api/v2/perfumes?nome=Dior')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      
      response.body.data.forEach(perfume => {
        expect(perfume.nome.toLowerCase()).toContain('dior');
      });
    });

    it('deve paginar resultados corretamente (200)', async () => {
      await criarMultiplosPerfumes(vendedor1.id, 12);

      const page1 = await request(app)
        .get('/api/v2/perfumes?page=1&limit=5')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(page1.body.data).toHaveLength(5);
      expect(page1.body.total).toBe(12);
      expect(page1.body.page).toBe(1);
      expect(page1.body.totalPages).toBe(3);

      const page3 = await request(app)
        .get('/api/v2/perfumes?page=3&limit=5')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(page3.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/v2/perfumes/:id - Atualizar Perfume', () => {
    
    it('deve atualizar perfume próprio (200)', async () => {
      const perfume = await criarPerfumeTeste(vendedor1.id, { 
        nome: 'Nome Original',
        preco: 100 
      });

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .field('nome', 'Nome Atualizado')
        .field('preco', 150)
        .expect(200);

      expect(response.body.data.nome).toBe('Nome Atualizado');
      expect(parseFloat(response.body.data.preco)).toBe(150);
    });

    it('deve bloquear atualização de perfume de outro vendedor (404)', async () => {
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .field('nome', 'Tentativa de Invasão')
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('DELETE /api/v2/perfumes/:id - Deletar Perfume', () => {
    
    it('deve deletar perfume próprio (200)', async () => {
      const perfume = await criarPerfumeTeste(vendedor1.id);

      const response = await request(app)
        .delete(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toContain('removidos com sucesso');

      const perfumeNoBanco = await prisma.perfume.findUnique({
        where: { id: perfume.id },
      });
      expect(perfumeNoBanco).toBeNull();
    });

    it('deve bloquear deleção de perfume de outro vendedor (404)', async () => {
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      await request(app)
        .delete(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);

      const perfumeNoBanco = await prisma.perfume.findUnique({
        where: { id: perfumeVendedor2.id },
      });
      expect(perfumeNoBanco).not.toBeNull();
    });
  });
});