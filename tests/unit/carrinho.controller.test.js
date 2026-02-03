import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as carrinhoController from '../../src/controllers/carrinho.controller.js';
import * as carrinhoService from '../../src/services/carrinho.service.js';

// 1. Mock do Service
vi.mock('../../src/services/carrinho.service.js');

describe('Carrinho Controller', () => {
  let req;
  let res;
  let next;

  // 2. Configuração antes de cada teste
  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(), // Permite encadeamento: res.status().json()
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('criarCarrinho', () => {
    it('deve criar um carrinho e retornar status 201', () => {
      const mockCarrinho = { id: '123', itens: [] };
      vi.mocked(carrinhoService.criarCarrinho).mockReturnValue(mockCarrinho);

      carrinhoController.criarCarrinho(req, res, next);

      expect(carrinhoService.criarCarrinho).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });

    it('deve chamar next com erro se o serviço falhar', () => {
      const erro = new Error('Erro ao criar');
      vi.mocked(carrinhoService.criarCarrinho).mockImplementation(() => { throw erro; });

      carrinhoController.criarCarrinho(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('verCarrinho', () => {
    it('deve retornar um carrinho existente com status 200', () => {
      req.params.carrinhoId = '123';
      const mockCarrinho = { id: '123', itens: [] };
      vi.mocked(carrinhoService.verCarrinho).mockReturnValue(mockCarrinho);

      carrinhoController.verCarrinho(req, res, next);

      expect(carrinhoService.verCarrinho).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });
  });

  describe('adicionarItem', () => {
    it('deve adicionar um item e retornar o carrinho atualizado', async () => {
      req.params.carrinhoId = '123';
      req.body = { perfumeId: 'p1', quantidade: 2 };
      const mockCarrinho = { id: '123', itens: [{ perfumeId: 'p1', quantidade: 2 }] };
      
      vi.mocked(carrinhoService.adicionarItem).mockResolvedValue(mockCarrinho);

      await carrinhoController.adicionarItem(req, res, next);

      expect(carrinhoService.adicionarItem).toHaveBeenCalledWith('123', 'p1', 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });

    it('deve tratar erros assíncronos chamando next', async () => {
      req.params.carrinhoId = '123';
      req.body = { perfumeId: 'p1', quantidade: 1 }; 
      
      const erro = new Error('Produto não encontrado');
      vi.mocked(carrinhoService.adicionarItem).mockRejectedValue(erro);

      await carrinhoController.adicionarItem(req, res, next);

      expect(next).toHaveBeenCalledWith(erro);
    });
  });

  describe('atualizarQuantidade', () => {
    it('deve atualizar a quantidade e retornar status 200', async () => {
      req.params = { carrinhoId: '123', perfumeId: 'p1' };
      req.body = { quantidade: 5 };
      const mockCarrinho = { id: '123', itens: [{ perfumeId: 'p1', quantidade: 5 }] };

      vi.mocked(carrinhoService.atualizarQuantidade).mockResolvedValue(mockCarrinho);

      await carrinhoController.atualizarQuantidade(req, res, next);

      expect(carrinhoService.atualizarQuantidade).toHaveBeenCalledWith('123', 'p1', 5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });
  });

  describe('removerItem', () => {
    it('deve remover um item e retornar status 200', () => {
      req.params = { carrinhoId: '123', perfumeId: 'p1' };
      const mockCarrinho = { id: '123', itens: [] };

      vi.mocked(carrinhoService.removerItem).mockReturnValue(mockCarrinho);

      carrinhoController.removerItem(req, res, next);

      expect(carrinhoService.removerItem).toHaveBeenCalledWith('123', 'p1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });
  });

  describe('limparCarrinho', () => {
    it('deve limpar o carrinho e retornar status 200', () => {
      req.params.carrinhoId = '123';
      const mockCarrinho = { id: '123', itens: [] };

      vi.mocked(carrinhoService.limparCarrinho).mockReturnValue(mockCarrinho);

      carrinhoController.limparCarrinho(req, res, next);

      expect(carrinhoService.limparCarrinho).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCarrinho });
    });
  });
});