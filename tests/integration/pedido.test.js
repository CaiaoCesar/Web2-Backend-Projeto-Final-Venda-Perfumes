import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../src/utils/appError.js';

// 1. Usar vi.hoisted para criar o mock ANTES do vi.mock
const prismaMock = vi.hoisted(() => {
  return {
    $transaction: vi.fn(),
    pedido: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    perfume: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
});

// 2. Mock do Database usando a variável hoisted
vi.mock('../../src/config/database.js', () => {
  return {
    default: prismaMock,
  };
});

// 3. Mock das utilidades do WhatsApp
vi.mock('../../src/utils/whatsapp.js', () => ({
  gerarMensagemDoCarrinho: vi.fn(() => 'Mensagem Formatada'),
  formatarTelefone: vi.fn(() => '5511999999999'),
  gerarLinkWhatsApp: vi.fn(() => 'https://wa.me/link-gerado'),
}));

// 4. Mock do CarrinhoService
// Aqui retornamos spies novos para cada função exportada
vi.mock('../../src/services/carrinho.service.js', () => {
  return {
    default: {
      verCarrinho: vi.fn(),
      limparCarrinho: vi.fn(),
    },
    verCarrinho: vi.fn(),
    limparCarrinho: vi.fn(),
  };
});

// Importações REAIS (acontecem depois dos mocks devido ao hoisting)
import pedidoController from '../../src/controllers/pedido.controller.js';
import * as carrinhoService from '../../src/services/carrinho.service.js';

describe('Integração: Fluxo de Pedidos', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();

    // CONFIGURAÇÃO DA TRANSAÇÃO
    // Importante: Simulamos que a transaction executa o callback passando o
    // próprio prismaMock como se fosse o cliente da transação (tx)
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback(prismaMock);
    });
  });

  describe('criarPedido', () => {
    it('deve criar um pedido com sucesso e retornar 201', async () => {
      // DADOS
      const mockCarrinho = {
        id: 'carrinho_123',
        vendorId: 10,
        total: 200,
        items: [
          { perfumeId: 1, nome: 'Perfume A', preco: 100, quantidade: 2 },
        ],
      };

      req.body = {
        nome: 'Cliente Teste',
        telefone: '11999999999',
        carrinhoId: 'carrinho_123',
      };

      // Configurar retorno do Carrinho Service
      vi.mocked(carrinhoService.verCarrinho).mockReturnValue(mockCarrinho);

      // Configurar retorno do Banco (dentro da transaction)
      prismaMock.perfume.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Perfume A',
        quantidade_estoque: 10,
      });

      const pedidoCriado = {
        id: 500,
        vendedorId: 10,
        vendedor: { nome: 'Vendedor Loja', telefone: '11888888888' },
      };
      
      // Mock do create e do update subsequente
      prismaMock.pedido.create.mockResolvedValue(pedidoCriado);
      prismaMock.pedido.update.mockResolvedValue({ 
        ...pedidoCriado, 
        mensagem_whatsapp: 'Msg Final' 
      });

      // EXECUÇÃO
      await pedidoController.criarPedido(req, res, next);

      // ASSERÇÕES
      expect(carrinhoService.verCarrinho).toHaveBeenCalledWith('carrinho_123');
      
      // Verifica decremento de estoque
      expect(prismaMock.perfume.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantidade_estoque: { decrement: 2 } },
      });

      // Verifica limpeza do carrinho
      expect(carrinhoService.limparCarrinho).toHaveBeenCalledWith('carrinho_123');

      // Verifica resposta
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 500,
        whatsapp_link: expect.any(String)
      }));
    });

    it('deve falhar se o estoque for insuficiente', async () => {
      const mockCarrinho = {
        id: 'carrinho_full',
        vendorId: 10,
        total: 500,
        items: [{ perfumeId: 1, quantidade: 20 }],
      };

      req.body = { nome: 'Cliente', telefone: '123', carrinhoId: 'carrinho_full' };
      vi.mocked(carrinhoService.verCarrinho).mockReturnValue(mockCarrinho);

      // Estoque baixo
      prismaMock.perfume.findUnique.mockResolvedValue({
        id: 1,
        nome: 'Perfume Raro',
        quantidade_estoque: 5, 
      });

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro).toBeInstanceOf(AppError);
      expect(erro.message).toMatch(/Estoque insuficiente/); // ou mensagem similar
      
      // Garante que não salvou nada
      expect(prismaMock.pedido.create).not.toHaveBeenCalled();
    });

    it('deve falhar se o carrinho estiver vazio', async () => {
      req.body = { nome: 'Cliente', telefone: '123', carrinhoId: 'carrinho_vazio' };
      
      vi.mocked(carrinhoService.verCarrinho).mockReturnValue({ items: [] });

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro.message).toMatch(/carrinho está vazio/);
    });
  });

  describe('listarPedidos', () => {
    it('deve listar pedidos do vendedor autenticado', async () => {
      req.user = { id: 10 };
      
      const pedidosMock = [{ id: 1 }, { id: 2 }];
      prismaMock.pedido.findMany.mockResolvedValue(pedidosMock);

      await pedidoController.listarPedidos(req, res, next);

      expect(prismaMock.pedido.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { vendedorId: 10 }
      }));
      expect(res.json).toHaveBeenCalledWith(pedidosMock);
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status se o pedido pertencer ao vendedor', async () => {
      req.params = { id: 100 };
      req.body = { status: 'ENVIADO' };
      req.user = { id: 5 };

      prismaMock.pedido.findUnique.mockResolvedValue({ id: 100, vendedorId: 5 });
      prismaMock.pedido.update.mockResolvedValue({ id: 100, status: 'ENVIADO' });

      await pedidoController.atualizarStatus(req, res, next);

      expect(prismaMock.pedido.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('deve negar acesso (403) se o vendedor for diferente', async () => {
      req.params = { id: 100 };
      req.body = { status: 'ENVIADO' };
      req.user = { id: 99 }; 

      prismaMock.pedido.findUnique.mockResolvedValue({ id: 100, vendedorId: 5 });

      await pedidoController.atualizarStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});