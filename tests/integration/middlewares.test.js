// tests/integration/middlewares.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { criarVendedorTeste, gerarTokenTeste, criarPerfumeTeste } from '../helpers/test-helpers.js';

describe('🛡️ Middlewares e Segurança - Testes de Integração', () => {
  
  let vendedor, token;

  beforeEach(async () => {
    vendedor = await criarVendedorTeste();
    token = gerarTokenTeste(vendedor.id, vendedor.email);
  });

  describe('AuthMiddleware - Validação de Token', () => {
    
    it('deve bloquear requisição sem header Authorization (401)', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes')
        .expect(401);

      expect(response.body.message).toContain('Token não fornecido');
    });

    it('deve bloquear token malformado sem "Bearer" (401)', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes')
        .set('Authorization', 'token-sem-bearer')
        .expect(401);

      expect(response.body.message).toContain('Token malformado');
    });
    
    it('deve bloquear token inválido (401)', async () => {
      const response = await request(app)
        .get('/api/v2/perfumes')
        .set('Authorization', 'Bearer token-inventado')
        .expect(401);

      expect(response.body.message).toContain('Token inválido ou expirado');
    });

    it('deve aceitar token válido no formato correto (200)', async () => {
      await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .get('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('ValidationMiddleware - Validação de Parâmetros', () => {
    
    it('deve rejeitar ID não numérico na URL (400)', async () => {
      const response = await request(app)
        .put('/api/v2/perfumes/abc')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Teste')
        .expect(400);

      expect(response.body.message).toContain('ID inválido');
    });

    it('deve rejeitar ID negativo (400)', async () => {
      const response = await request(app)
        .put('/api/v2/perfumes/-5')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Teste')
        .expect(400);

      expect(response.body.message).toContain('ID inválido');
    });

    it('deve aceitar ID numérico válido', async () => {
      const perfume = await criarPerfumeTeste(vendedor.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfume.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Nome Atualizado')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Validação de Dados - Criação de Perfume', () => {
    
    it('deve rejeitar criação sem campos obrigatórios (400)', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Apenas Nome')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve rejeitar preço negativo (400)', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Perfume Teste')
        .field('marca', 'Marca')
        .field('descricao', 'Descrição')
        .field('preco', -50)
        .field('frasco', 100)
        .field('quantidade_estoque', 10)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('deve rejeitar quantidade de estoque negativa (400)', async () => {
      const response = await request(app)
        .post('/api/v2/perfumes')
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Perfume Teste')
        .field('marca', 'Marca')
        .field('descricao', 'Descrição')
        .field('preco', 100)
        .field('frasco', 100)
        .field('quantidade_estoque', -5)
        .expect(400);

      expect(response.body.message).toContain('Dados de cadastro inválidos');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Segurança de Propriedade (Ownership)', () => {
    
    it('deve impedir edição de perfume de outro vendedor (404)', async () => {
      const vendedor2 = await criarVendedorTeste({ 
        email: `vendedor2-${Date.now()}@teste.com` 
      });
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      const response = await request(app)
        .put(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('nome', 'Tentativa de Hack')
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });

    it('deve impedir deleção de perfume de outro vendedor (404)', async () => {
      const vendedor2 = await criarVendedorTeste({ 
        email: `vendedor2-delete-${Date.now()}@teste.com` 
      });
      const perfumeVendedor2 = await criarPerfumeTeste(vendedor2.id);

      const response = await request(app)
        .delete(`/api/v2/perfumes/${perfumeVendedor2.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toContain('não encontrado');
    });

    it('deve impedir atualização de estoque de outro vendedor (404)', async () => {
      const vendedor2 = await criarVendedorTeste({ 
        email: `vendedor2-estoque-${Date.now()}@teste.com` 
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