import { jest } from '@jest/globals';
import * as pedidoController from './pedido.controller.js';
import * as pedidoService from '../services/pedido.service.js';
import * as carrinhoService from '../services/carrinho.service.js';
import { AppError } from '../utils/appError.js';

// Mock dos serviços
jest.mock('../services/pedido.service.js');
jest.mock('../services/carrinho.service.js');

describe('Pedido Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 } // Simula usuário autenticado
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarPedido', () => {
    it('deve criar um pedido e retornar status 201', async () => {
      req.body = { nome: 'Cliente Teste', telefone: '123', carrinhoId: 'cart-123' };
      
      const mockCarrinho = { items: [{ id: 1 }], vendorId: 1 };
      const mockPedido = { id: 100, status: 'PENDENTE' };

      carrinhoService.verCarrinho.mockReturnValue(mockCarrinho);
      pedidoService.criarPedido.mockResolvedValue(mockPedido);

      await pedidoController.criarPedido(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPedido);
      expect(carrinhoService.limparCarrinho).toHaveBeenCalledWith('cart-123');
    });

    it('deve chamar next com AppError se faltarem dados no body', async () => {
      req.body = { nome: 'Incompleto' };

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('deve lançar erro se o carrinho estiver vazio', async () => {
      req.body = { nome: 'C', telefone: 'T', carrinhoId: 'id' };
      carrinhoService.verCarrinho.mockReturnValue({ items: [] });

      await pedidoController.criarPedido(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'O carrinho está vazio. Adicione itens antes de finalizar.'
      }));
    });
  });

  describe('listarPedidos', () => {
    it('deve retornar a lista de pedidos do vendedor logado', async () => {
      const mockLista = [{ id: 1 }, { id: 2 }];
      pedidoService.listarPedidos.mockResolvedValue(mockLista);

      await pedidoController.listarPedidos(req, res, next);

      expect(pedidoService.listarPedidos).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockLista);
    });

    it('deve retornar 401 se não houver usuário na requisição', async () => {
      req.user = null;

      await pedidoController.listarPedidos(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('buscarPedido', () => {
    it('deve buscar o pedido pelo ID e vendedor', async () => {
      req.params.id = '50';
      const mockPedido = { id: 50, nome_cliente: 'João' };
      pedidoService.buscarPorId.mockResolvedValue(mockPedido);

      await pedidoController.buscarPedido(req, res, next);

      expect(pedidoService.buscarPorId).toHaveBeenCalledWith('50', 1);
      expect(res.json).toHaveBeenCalledWith(mockPedido);
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status com sucesso', async () => {
      req.params.id = '10';
      req.body = { status: 'ENTREGUE' };
      pedidoService.atualizarStatus.mockResolvedValue({ id: 10, status: 'ENTREGUE' });

      await pedidoController.atualizarStatus(req, res, next);

      expect(res.json).toHaveBeenCalled();
      expect(pedidoService.atualizarStatus).toHaveBeenCalledWith('10', 1, 'ENTREGUE');
    });

    it('deve dar erro se o status não for enviado', async () => {
      req.body = {};
      await pedidoController.atualizarStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});