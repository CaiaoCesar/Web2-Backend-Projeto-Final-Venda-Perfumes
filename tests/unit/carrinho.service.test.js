import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as carrinhoService from '../../src/services/carrinho.service.js';
import prisma from '../../src/config/database.js'; 

// 1. Mock do Prisma Client
vi.mock('../../src/config/database.js', () => ({
  default: {
    perfume: {
      findUnique: vi.fn(),
    },
  },
}));

// 2. Mock do AppError
vi.mock('../../utils/appError.js', () => ({
  AppError: class extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

describe('Carrinho Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPerfume = (id = 1, preco = 100, estoque = 50, vendedorId = 10) => ({
    id,
    nome: `Perfume Teste ${id}`,
    preco,
    quantidade_estoque: estoque,
    foto: 'foto.jpg',
    vendedorId,
  });

  describe('criarCarrinho()', () => {
    it('deve criar um carrinho vazio com a estrutura correta', () => {
      const carrinho = carrinhoService.criarCarrinho();

      expect(carrinho).toHaveProperty('id');
      expect(carrinho.items).toEqual([]);
      expect(carrinho.total).toBe(0);
      expect(carrinho.vendorId).toBeNull();
      expect(carrinho.createdAt).toBeDefined();
    });
    
    it('deve aceitar itens iniciais se fornecidos', () => {
        const itensIniciais = [{ perfumeId: 1, preco: 100, quantidade: 1 }];
        const carrinho = carrinhoService.criarCarrinho(itensIniciais);
        expect(carrinho.items).toHaveLength(1);
        expect(carrinho.total).toBe(100);
    });
  });

  describe('adicionarItem()', () => {
    it('deve lançar erro se o carrinho não existir', async () => {
        await expect(
            carrinhoService.adicionarItem('id_inexistente_999', 1, 1)
        ).rejects.toThrow('Carrinho não encontrado');
    });

    it('deve adicionar um novo item e calcular o total', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const perfume = mockPerfume(1, 100, 10);
      
      prisma.perfume.findUnique.mockResolvedValue(perfume);

      const result = await carrinhoService.adicionarItem(carrinho.id, 1, 2);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantidade).toBe(2);
      expect(result.total).toBe(200); 
      expect(result.vendorId).toBe(perfume.vendedorId);
    });

    it('deve lançar erro se a quantidade for inválida (NaN)', async () => {
        const carrinho = carrinhoService.criarCarrinho();
        await expect(
            carrinhoService.adicionarItem(carrinho.id, 1, 'texto')
        ).rejects.toThrow('Quantidade deve ser um número válido');
    });

    it('deve somar quantidade se o item já existir no carrinho', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const perfume = mockPerfume(1, 100, 20);
      prisma.perfume.findUnique.mockResolvedValue(perfume);

      await carrinhoService.adicionarItem(carrinho.id, 1, 1);
      const result = await carrinhoService.adicionarItem(carrinho.id, 1, 3);

      expect(result.items[0].quantidade).toBe(4);
      expect(result.total).toBe(400);
    });

    it('deve lançar erro se o estoque for insuficiente', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const perfume = mockPerfume(1, 100, 5);
      prisma.perfume.findUnique.mockResolvedValue(perfume);

      await expect(
        carrinhoService.adicionarItem(carrinho.id, 1, 10)
      ).rejects.toThrow(/maior que o estoque/);
    });

    it('deve impedir mistura de vendedores', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const p1 = mockPerfume(1, 50, 10, 1001);
      const p2 = mockPerfume(2, 50, 10, 1002);

      prisma.perfume.findUnique
        .mockResolvedValueOnce(p1)
        .mockResolvedValueOnce(p2);

      await carrinhoService.adicionarItem(carrinho.id, 1, 1);

      await expect(
        carrinhoService.adicionarItem(carrinho.id, 2, 1)
      ).rejects.toThrow('O carrinho só pode conter produtos de um único vendedor');
    });
  });

  describe('atualizarQuantidade()', () => {
    it('deve atualizar a quantidade corretamente', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const perfume = mockPerfume(1, 50, 20);
      prisma.perfume.findUnique.mockResolvedValue(perfume);

      await carrinhoService.adicionarItem(carrinho.id, 1, 1);

      const result = await carrinhoService.atualizarQuantidade(carrinho.id, 1, 5);
      
      expect(result.items[0].quantidade).toBe(5);
      expect(result.total).toBe(250);
    });

    it('deve remover o item se a quantidade for < 1', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const perfume = mockPerfume(1);
      prisma.perfume.findUnique.mockResolvedValue(perfume);

      await carrinhoService.adicionarItem(carrinho.id, 1, 1);

      const result = await carrinhoService.atualizarQuantidade(carrinho.id, 1, 0);

      expect(result.items).toHaveLength(0);
      expect(result.vendorId).toBeNull();
    });
  });
  
  describe('removerItem()', () => {
    it('deve remover item específico', async () => {
      const carrinho = carrinhoService.criarCarrinho();
      const p1 = mockPerfume(1);
      prisma.perfume.findUnique.mockResolvedValue(p1);
      await carrinhoService.adicionarItem(carrinho.id, 1, 1);
      
      const result = carrinhoService.removerItem(carrinho.id, 1);
      expect(result.items).toHaveLength(0);
    });
  });
});