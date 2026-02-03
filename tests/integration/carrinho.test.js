import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import carrinhoController from '../../src/controllers/carrinho.controller.js';
import prisma from '../../src/config/database.js'; 

// 1. Mock do Prisma
vi.mock('../../src/config/database.js', () => ({
  default: {
    perfume: {
      findUnique: vi.fn(),
    },
  },
}));

// 2. Mock do AppError
vi.mock('../../utils/appError.js', () => {
  return {
    AppError: class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
      }
    },
  };
});

const app = express();
app.use(express.json());

// Rotas
app.post('/carrinho', carrinhoController.criarCarrinho);
app.get('/carrinho/:carrinhoId', carrinhoController.verCarrinho);
app.post('/carrinho/:carrinhoId/itens', carrinhoController.adicionarItem);
app.patch('/carrinho/:carrinhoId/itens/:perfumeId', carrinhoController.atualizarQuantidade);
app.delete('/carrinho/:carrinhoId/itens/:perfumeId', carrinhoController.removerItem);
app.delete('/carrinho/:carrinhoId', carrinhoController.limparCarrinho);

// Middleware de Erro
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
  });
});

describe('Integração: Carrinho de Compras', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let carrinhoIdGlobal;

  const perfume1 = {
    id: 1,
    nome: 'Perfume A',
    preco: 100,
    quantidade_estoque: 10,
    foto: 'foto_a.jpg',
    vendedorId: 99,
  };

  const perfumeOutroVendedor = {
    id: 3,
    nome: 'Perfume C',
    preco: 150,
    quantidade_estoque: 10,
    foto: 'foto_c.jpg',
    vendedorId: 88, 
  };

  describe('POST /carrinho (Criar Carrinho)', () => {
    it('Deve criar um novo carrinho vazio com sucesso', async () => {
      const response = await request(app).post('/carrinho');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      carrinhoIdGlobal = response.body.data.id;
    });
  });

  describe('POST /carrinho/:id/itens (Adicionar Item)', () => {
    it('Deve adicionar um item ao carrinho com sucesso', async () => {
      prisma.perfume.findUnique.mockResolvedValue(perfume1);

      const response = await request(app)
        .post(`/carrinho/${carrinhoIdGlobal}/itens`)
        .send({ perfumeId: 1, quantidade: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.total).toBe(200);
    });

    it('Deve retornar 404 se o ID do carrinho não existir', async () => {
      const response = await request(app)
        .post('/carrinho/id_invalido_999/itens')
        .send({ perfumeId: 1, quantidade: 1 });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/Carrinho não encontrado/);
    });

    it('Deve retornar 400 se quantidade for inválida', async () => {
        const response = await request(app)
          .post(`/carrinho/${carrinhoIdGlobal}/itens`)
          .send({ perfumeId: 1, quantidade: 'abc' });
  
        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/número válido/);
    });

    it('Deve impedir mistura de vendedores', async () => {
      prisma.perfume.findUnique.mockResolvedValue(perfumeOutroVendedor);

      const response = await request(app)
        .post(`/carrinho/${carrinhoIdGlobal}/itens`)
        .send({ perfumeId: 3, quantidade: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/só pode conter produtos de um único vendedor/);
    });
  });
});