// tests/integration/auth.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { criarVendedorTeste } from '../helpers/test-helpers.js';
import prisma from '../../src/config/database.js';

describe('🔐 Autenticação - Testes de Integração', () => {
  
  describe('POST /api/v2/vendedores/register', () => {
    
    it('deve criar vendedor com dados válidos (201)', async () => {
      const novoVendedor = {
        nome: 'João Silva',
        email: `joao-${Date.now()}@teste.com`,
        senha: 'senha123',
        telefone: '31988887777',
        nome_loja: 'Perfumes Salinas',
        cidade: 'Salinas',
        estado: 'MG'                  
      };

      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send(novoVendedor)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', novoVendedor.email);
      expect(response.body.data).not.toHaveProperty('senha');

      const vendedorNoBanco = await prisma.vendedor.findUnique({
        where: { email: novoVendedor.email },
      });
      
      expect(vendedorNoBanco).not.toBeNull();
      expect(vendedorNoBanco.nome).toBe(novoVendedor.nome);
      expect(vendedorNoBanco.senha).not.toBe(novoVendedor.senha);
    });

    it('deve rejeitar registro com email duplicado (400)', async () => {
      const email = `duplicado-${Date.now()}@teste.com`;
      
      // Criar primeiro vendedor
      await criarVendedorTeste({ email });

      // Tentar criar segundo vendedor com mesmo email
      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send({
          nome: 'Outro Vendedor',
          email,
          senha: 'senha456',
          telefone: '31977776666',
          nome_loja: 'Loja Teste',
          cidade: 'Salinas',
          estado: 'MG'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      // ✅ CORRIGIDO: A mensagem real do sistema é "Este e-mail já está registrado."
      expect(response.body.message).toContain('e-mail já está registrado');
    });

    it('deve rejeitar registro com dados inválidos (400)', async () => {
      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send({
          nome: 'Teste',
          email: 'email-invalido',
          senha: '12',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v2/vendedores/login', () => {
    
    it('deve fazer login com credenciais válidas e retornar JWT (200)', async () => {
      const senha = 'senha123';
      
      const vendedor = await criarVendedorTeste({ 
        email: `login-${Date.now()}@teste.com`,
        senha 
      });

      const response = await request(app)
        .post('/api/v2/vendedores/login') 
        .send({ 
          email: vendedor.email, 
          senha: senha 
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(20);
      expect(response.body.data.vendedor.email).toBe(vendedor.email);
    });

    it('deve rejeitar login com senha incorreta (401)', async () => {
      const vendedor = await criarVendedorTeste({ 
        email: `senhaerrada-${Date.now()}@teste.com`,
        senha: 'senhaCorreta123' 
      });

      const response = await request(app)
        .post('/api/v2/vendedores/login')
        .send({
          email: vendedor.email,
          senha: 'senhaErrada456',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      // ✅ CORRIGIDO: A mensagem real do sistema é "E-mail ou senha incorretos"
      expect(response.body.message).toContain('E-mail ou senha incorretos');
    });

    it('deve rejeitar login com email não cadastrado (401)', async () => {
      const response = await request(app)
        .post('/api/v2/vendedores/login')
        .send({
          email: `naoexiste-${Date.now()}@teste.com`,
          senha: 'qualquersenha',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      // ✅ CORRIGIDO: A mensagem real do sistema é "E-mail ou senha incorretos"
      expect(response.body.message).toContain('E-mail ou senha incorretos');
    });
  });
});