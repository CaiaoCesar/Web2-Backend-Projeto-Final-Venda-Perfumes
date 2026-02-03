// tests/integration/auth.test.js

/**
 * ARQUIVO DE TESTES DE INTEGRAÇÃO - AUTENTICAÇÃO
 * Objetivo: Testar se as rotas de Registro e Login estão conversando 
 * corretamente com o Banco de Dados (Prisma) e as regras do sistema.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest'; // Simula as requisições HTTP sem precisar subir o servidor manualmente
import app from '../../src/app.js';
import { criarVendedorTeste } from '../helpers/test-helpers.js';
import prisma from '../../src/config/database.js'; // Conexão direta com o banco para conferência

// Agrupamento principal dos testes de autenticação
describe('Autenticação - Testes de Integração', () => {
  
  // Testes focados na criação de novas contas
  describe('POST /api/v2/vendedores/register', () => {
    
    it('deve criar vendedor com dados válidos', async () => {
      // Preparamos um objeto seguindo as regras do Zod (nome, email, etc)
      const novoVendedor = {
        nome: 'João Silva',
        email: `joao-${Date.now()}@teste.com`, // Usamos Date.now() para garantir um e-mail único em cada teste
        senha: 'senha123',
        telefone: '31988887777',
        nome_loja: 'Perfumes Salinas',
        cidade: 'Salinas',
        estado: 'MG',
      };

      // Simulamos o envio desse objeto para a rota de registro
      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send(novoVendedor)
        .expect(201); // Esperamos o status "Created"

      // Verificamos se a resposta JSON veio conforme o planejado
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', novoVendedor.email);
      expect(response.body.data).not.toHaveProperty('senha'); // Nunca retornar a senha

      // Checamos se o dado realmente entrou no banco Neon
      const vendedorNoBanco = await prisma.vendedor.findUnique({
        where: { email: novoVendedor.email },
      });

      expect(vendedorNoBanco).not.toBeNull();
      expect(vendedorNoBanco.nome).toBe(novoVendedor.nome);
      expect(vendedorNoBanco.senha).not.toBe(novoVendedor.senha); // A senha deve estar criptografada no banco
    });

    it('deve rejeitar registro com email duplicado', async () => {
      const email = `duplicado-${Date.now()}@teste.com`;

      // Criamos o primeiro vendedor para existir no banco este e-mail
      await criarVendedorTeste({ email });

      // Tentamos criar um segundo vendedor com o mesmo e-mail e esperamos falha
      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send({
          nome: 'Outro Vendedor',
          email,
          senha: 'senha456',
          telefone: '31977776666',
          nome_loja: 'Loja Teste',
          cidade: 'Salinas',
          estado: 'MG',
        })
        .expect(400); // Bad Request

      expect(response.body).toHaveProperty('success', false);
      // Validamos se a mensagem de erro é a que configuramos no Backend
      expect(response.body.message).toContain('e-mail já está registrado');
    });

    it('deve rejeitar registro com dados inválidos', async () => {
      // Testamos a robustez do Zod enviando dados propositalmente errados
      const response = await request(app)
        .post('/api/v2/vendedores/register')
        .send({
          nome: 'Teste',
          email: 'email-invalido', // E-mail sem @
          senha: '12', // Senha muito curta
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // Testes focados no acesso ao sistema (Login)
  describe('POST /api/v2/vendedores/login', () => {
    
    it('deve fazer login com credenciais válidas e retornar JWT', async () => {
      const senha = 'senha123';

      // Criamos um vendedor antes para ter alguém para logar
      const vendedor = await criarVendedorTeste({
        email: `login-${Date.now()}@teste.com`,
        senha,
      });

      const response = await request(app)
        .post('/api/v2/vendedores/login')
        .send({
          email: vendedor.email,
          senha: senha,
        })
        .expect(200);

      // O ponto principal aqui é o Token JWT, essencial para rotas protegidas
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(20);
      expect(response.body.data.vendedor.email).toBe(vendedor.email);
    });

    it('deve rejeitar login com senha incorreta', async () => {
      // Cria um novo vendedor para testar a senha
      const vendedor = await criarVendedorTeste({
        email: `senhaerrada-${Date.now()}@teste.com`,
        senha: 'senhaCorreta123',
      });

      const response = await request(app)
        .post('/api/v2/vendedores/login')
        .send({
          email: vendedor.email,
          senha: 'senhaErrada456',
        })
        .expect(401); // Unauthorized

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('E-mail ou senha incorretos');
    });

    it('deve rejeitar login com email não cadastrado', async () => {
      const response = await request(app)
        .post('/api/v2/vendedores/login')
        .send({
          email: `naoexiste-${Date.now()}@teste.com`,
          senha: 'qualquersenha',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('E-mail ou senha incorretos');
    });
  });
});