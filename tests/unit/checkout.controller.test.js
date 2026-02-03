import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutWhatsApp } from '../../src//controllers/checkout.controller.js';
import * as carrinhoService from '../../src/services/carrinho.service.js';
import * as checkoutService from '../../src/services/checkout.service.js';
import { AppError } from '../../src/utils/appError.js';

// Mock dos serviços externos
vi.mock('../../src/services/carrinho.service.js');
vi.mock('../../src/services/checkout.service.js');

// Mock básico para o AppError
vi.mock('../../src/utils/appError.js', () => {
  return {
    AppError: class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
      }
    },
  };
});

describe('Checkout Controller - checkoutWhatsApp', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuração básica dos objetos do Express
    req = {
      body: {
        nome: 'João Silva',
        telefone: '11999999999',
        carrinhoId: 'carrinho-123',
      },
    };
    res = {
      redirect: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('deve redirecionar para o WhatsApp com o link correto quando o carrinho é válido', async () => {
    const mockCarrinho = {
      items: [
        { nome: 'Perfume A', quantidade: 1, preco: 100 },
        { nome: 'Perfume B', quantidade: 2, preco: 50 },
      ],
      total: 200,
    };
    const mockTelefoneFormatado = '5511999999999';
    const mockMensagem = 'Mensagem formatada';
    const mockLink = 'https://wa.me/link-gerado';

    carrinhoService.verCarrinho.mockReturnValue(mockCarrinho);
    checkoutService.formatarTelefone.mockReturnValue(mockTelefoneFormatado);
    checkoutService.gerarMensagemDoCarrinho.mockReturnValue(mockMensagem);
    checkoutService.gerarLinkWhatsApp.mockReturnValue(mockLink);

    await checkoutWhatsApp(req, res, next);

    // 1. Verifica se buscou o carrinho
    expect(carrinhoService.verCarrinho).toHaveBeenCalledWith('carrinho-123');
    
    // 2. Verifica se formatou o telefone
    expect(checkoutService.formatarTelefone).toHaveBeenCalledWith('11999999999');

    // 3. Verifica se gerou a mensagem com os dados corretos
    expect(checkoutService.gerarMensagemDoCarrinho).toHaveBeenCalledWith({
      nomeCliente: 'João Silva',
      items: mockCarrinho.items,
      valorTotal: mockCarrinho.total,
    });

    // 4. Verifica se gerou o link
    expect(checkoutService.gerarLinkWhatsApp).toHaveBeenCalledWith({
      telefoneFormatado: mockTelefoneFormatado,
      mensagem: mockMensagem,
    });

    // 5. Verifica que retornou o link em JSON
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ link: mockLink });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next com erro se o carrinho estiver vazio', async () => {
    const mockCarrinhoVazio = {
      items: [],
      total: 0,
    };
    carrinhoService.verCarrinho.mockReturnValue(mockCarrinhoVazio);

    await checkoutWhatsApp(req, res, next);

    expect(carrinhoService.verCarrinho).toHaveBeenCalled();
    expect(checkoutService.formatarTelefone).not.toHaveBeenCalled();
    
    // Verifica se next foi chamado com uma instância de AppError
    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(AppError);
    expect(errorArg.message).toContain('O carrinho está vazio');
    expect(errorArg.statusCode).toBe(400);
  });

  it('deve chamar next com erro se o carrinho não possuir a propriedade items', async () => {
    carrinhoService.verCarrinho.mockReturnValue({ total: 0 });

    await checkoutWhatsApp(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toContain('O carrinho está vazio');
  });

  it('deve repassar erros do serviço para o middleware next', async () => {
    const errorSimulado = new Error('Erro ao buscar carrinho');
    carrinhoService.verCarrinho.mockImplementation(() => {
      throw errorSimulado;
    });

    await checkoutWhatsApp(req, res, next);

    expect(next).toHaveBeenCalledWith(errorSimulado);
    expect(res.json).not.toHaveBeenCalled();
  });
});