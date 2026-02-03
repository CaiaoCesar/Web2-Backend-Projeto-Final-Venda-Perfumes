import { jest } from '@jest/globals';
import { criarPedido, buscarPorId } from './pedido.service.js';
import prisma from '../config/database.js';
import * as whatsappUtils from '../utils/whatsapp.js';
import { AppError } from '../utils/appError.js';

// Mock do Prisma
jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    pedido: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock dos Utils de WhatsApp
jest.mock('../utils/whatsapp.js');

describe('Pedido Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarPedido', () => {
    const mockCarrinho = {
      vendorId: 1,
      total: 100,
      items: [
        { perfumeId: 10, quantidade: 2, preco: 50 }
      ]
    };

    const mockDadosCliente = {
      nomeCliente: 'João Silva',
      telefoneCliente: '11999999999'
    };

    it('deve lançar erro se o carrinho estiver vazio', async () => {
      await expect(criarPedido({ ...mockDadosCliente, carrinho: { items: [] } }))
        .rejects.toThrow(new AppError('Carrinho inválido ou vazio', 400));
    });

    it('deve criar um pedido com sucesso e retornar o link do WhatsApp', async () => {
      // Mock do comportamento interno da transação (tx)
      const mockTx = {
        perfume: {
          findUnique: jest.fn().mockResolvedValue({ id: 10, nome: 'Perfume Luxo', quantidade_estoque: 10 }),
          update: jest.fn(),
        },
        pedido: {
          create: jest.fn().mockResolvedValue({
            id: 1,
            vendedor: { nome: 'Vendedor 1', telefone: '1188888888' },
            ...mockDadosCliente
          }),
          update: jest.fn().mockResolvedValue({ id: 1, status: 'PENDENTE' }),
        }
      };

      // Simula a execução da transação passando o mockTx
      prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));
      
      whatsappUtils.gerarMensagemDoCarrinho.mockReturnValue('Mensagem formatada');
      whatsappUtils.formatarTelefone.mockReturnValue('551188888888');
      whatsappUtils.gerarLinkWhatsApp.mockReturnValue('https://wa.me/551188888888?text=...');

      const resultado = await criarPedido({ ...mockDadosCliente, carrinho: mockCarrinho });

      expect(mockTx.perfume.findUnique).toHaveBeenCalled();
      expect(mockTx.pedido.create).toHaveBeenCalled();
      expect(mockTx.perfume.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { quantidade_estoque: { decrement: 2 } }
      }));
      expect(resultado).toHaveProperty('whatsapp_link');
    });

    it('deve lançar erro se o estoque for insuficiente', async () => {
      const mockTx = {
        perfume: {
          findUnique: jest.fn().mockResolvedValue({ id: 10, nome: 'Sem Estoque', quantidade_estoque: 1 }),
        }
      };
      prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));

      await expect(criarPedido({ ...mockDadosCliente, carrinho: mockCarrinho }))
        .rejects.toThrow(/Estoque insuficiente/);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar o pedido se encontrado e o vendedor for o dono', async () => {
      const mockPedido = { id: 1, vendedorId: 1, total: 100 };
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);

      const resultado = await buscarPorId(1, 1);
      expect(resultado).toEqual(mockPedido);
    });

    it('deve lançar 403 se o vendedor tentar acessar pedido de outro', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ id: 1, vendedorId: 2 });

      await expect(buscarPorId(1, 1)).rejects.toThrow(new AppError('Acesso negado ao pedido', 403));
    });

    it('deve lançar 404 se o pedido não existir', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(buscarPorId(999, 1)).rejects.toThrow(new AppError('Pedido não encontrado', 404));
    });
  });
});