// tests/integration/auth.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { criarVendedorTeste } from '../helpers/test-helpers.js';
import prisma from '../../src/config/database.js';

describe('🔐 Autenticação - Testes de Integração', () => {
  
  describe('POST /api/v2/auth/registro', () => {
    
    it('deve criar vendedor com dados válidos (201)', async () => {
      const novoVendedor = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'senha123',
        telefone: '31988887777',
      };

      const response = await request(app)
        .post('/api/v2/auth/registro')
        .send(novoVendedor)
        .expect(201);

      // Verificar estrutura da resposta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', novoVendedor.email);
      expect(response.body.data).not.toHaveProperty('senha'); // Senha não deve retornar

      // Verificar se foi salvo no banco
      const vendedorNoBanco = await prisma.vendedor.findUnique({
        where: { email: novoVendedor.email },
      });
      
      expect(vendedorNoBanco).not.toBeNull();
      expect(vendedorNoBanco.nome).toBe(novoVendedor.nome);
      expect(vendedorNoBanco.senha).not.toBe(novoVendedor.senha); // Deve estar hasheada
    });

    it('deve rejeitar registro com email duplicado (400)', async () => {
      const email = 'duplicado@teste.com';
      
      // Criar primeiro vendedor
      await criarVendedorTeste({ email });

      // Tentar criar segundo vendedor com mesmo email
      const response = await request(app)
        .post('/api/v2/auth/registro')
        .send({
          nome: 'Outro Vendedor',
          email, // Email duplicado
          senha: 'senha456',
          telefone: '31977776666',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('já está cadastrado');
    });

    it('deve rejeitar registro com dados inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/v2/auth/registro')
        .send({
          nome: 'Teste',
          email: 'email-invalido', // Email sem @
          senha: '12', // Senha muito curta
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v2/auth/login', () => {
    
    it('deve fazer login com credenciais válidas e retornar JWT (200)', async () => {
      const senha = 'senha123';
      const vendedor = await criarVendedorTeste({ 
        email: 'login@teste.com',
        senha 
      });

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: vendedor.email,
          senha, // Senha em texto puro (não hasheada)
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(20); // JWT é longo
    });

    it('deve rejeitar login com senha incorreta (401)', async () => {
      const vendedor = await criarVendedorTeste({ 
        email: 'senhaerrada@teste.com',
        senha: 'senhaCorreta123' 
      });

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: vendedor.email,
          senha: 'senhaErrada456', // Senha incorreta
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });

    it('deve rejeitar login com email não cadastrado (401)', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'naoexiste@teste.com',
          senha: 'qualquersenha',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });
  });
});