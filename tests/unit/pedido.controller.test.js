import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as pedidoController from '../../src/controllers/pedido.controller.js';
import * as pedidoService from '../../src/services/pedido.service.js';
import * as carrinhoService from '../../src/services/carrinho.service.js';
import { AppError } from '../../src/utils/appError.js';

// Mock dos serviços
vi.mock('../../src/services/pedido.service.js');
vi.mock('../../src/services/carrinho.service.js');

describe('Pedido Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Resetar mocks e objetos antes de cada teste
    req = {
      body: {},
      params: {},
      user: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('criarPedido', () => {
    it('deve criar um pedido com sucesso e limpar o carrinho (201)', async () => {

      req.body = {
        nome: 'João Silva',
        telefone: '11999999999',
        carrinhoId: 'carrinho_123'
      };

      const mockCarrinho = {
        id: 'carrinho_123',
        items: [{ perfumeId: 1, quantidade: 1, preco: 100 }],
        total: 100
      };

      const mockPedidoCriado = {
        id: 1,
        nome_cliente: 'João Silva',
        valor_total: 100
      };

      carrinhoService.verCarrinho.mockReturnValue(mockCarrinho);
      pedidoService.criarPedido.mockResolvedValue(mockPedidoCriado);

      await pedidoController.criarPedido(req, res, next);

      expect(carrinhoService.verCarrinho).toHaveBeenCalledWith('carrinho_123');
      expect(pedidoService.criarPedido).toHaveBeenCalledWith({
        nomeCliente: 'João Silva',
        telefoneCliente: '11999999999',
        carrinho: mockCarrinho
      });
      expect(carrinhoService.limparCarrinho).toHaveBeenCalledWith('carrinho_123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPedidoCriado);
    });

    it('deve falhar se dados estiverem incompletos', async () => {
      req.body = { nome: 'João' }; // Falta telefone e carrinhoId

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro).toBeInstanceOf(AppError);
      expect(erro.message).toBe('Dados incompletos');
      expect(erro.statusCode).toBe(400);
    });

    it('deve falhar se o carrinho estiver vazio', async () => {
      req.body = {
        nome: 'João',
        telefone: '11999',
        carrinhoId: 'carrinho_vazio'
      };

      carrinhoService.verCarrinho.mockReturnValue({ items: [] });

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro.message).toContain('carrinho está vazio');
    });
  });

  describe('listarPedidos', () => {
    it('deve listar pedidos do vendedor autenticado', async () => {
      req.user = { id: 10 };
      const mockPedidos = [{ id: 1, status: 'PENDENTE' }];
      
      pedidoService.listarPedidos.mockResolvedValue(mockPedidos);

      await pedidoController.listarPedidos(req, res, next);

      expect(pedidoService.listarPedidos).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockPedidos);
    });

    it('deve retornar erro 401 se não houver vendedor logado', async () => {
      req.user = undefined; // Usuário não autenticado

      await pedidoController.listarPedidos(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro.statusCode).toBe(401);
      expect(erro.message).toBe('Não autorizado');
    });
  });

  describe('buscarPedido', () => {
    it('deve buscar um pedido por ID', async () => {
      req.params.id = 5;
      req.user = { id: 10 };
      const mockPedido = { id: 5, vendedorId: 10 };

      pedidoService.buscarPorId.mockResolvedValue(mockPedido);

      await pedidoController.buscarPedido(req, res, next);

      expect(pedidoService.buscarPorId).toHaveBeenCalledWith(5, 10);
      expect(res.json).toHaveBeenCalledWith(mockPedido);
    });

    it('deve repassar erro do serviço se pedido não for encontrado', async () => {
      req.params.id = 99;
      req.user = { id: 10 };
      
      const errorMock = new AppError('Pedido não encontrado', 404);
      pedidoService.buscarPorId.mockRejectedValue(errorMock);

      await pedidoController.buscarPedido(req, res, next);

      expect(next).toHaveBeenCalledWith(errorMock);
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status do pedido', async () => {
      req.params.id = 1;
      req.body.status = 'ENVIADO';
      req.user = { id: 10 };

      const mockAtualizado = { id: 1, status: 'ENVIADO' };
      pedidoService.atualizarStatus.mockResolvedValue(mockAtualizado);

      await pedidoController.atualizarStatus(req, res, next);

      expect(pedidoService.atualizarStatus).toHaveBeenCalledWith(1, 10, 'ENVIADO');
      expect(res.json).toHaveBeenCalledWith(mockAtualizado);
    });

    it('deve falhar se status não for fornecido', async () => {
      req.params.id = 1;
      req.body = {}; // Sem status
      req.user = { id: 10 };

      await pedidoController.atualizarStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      const erro = next.mock.calls[0][0];
      expect(erro.message).toBe('Status é obrigatório');
    });
  });

  describe('atualizarPedido', () => {
    it('deve atualizar dados do pedido', async () => {
      req.params.id = 1;
      req.user = { id: 10 };
      req.body = { nome_cliente: 'Novo Nome' };

      const mockAtualizado = { id: 1, nome_cliente: 'Novo Nome' };
      pedidoService.atualizarPedido.mockResolvedValue(mockAtualizado);

      await pedidoController.atualizarPedido(req, res, next);

      expect(pedidoService.atualizarPedido).toHaveBeenCalledWith(1, 10, req.body);
      expect(res.json).toHaveBeenCalledWith(mockAtualizado);
    });
  });
});