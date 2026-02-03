// checkout.integration.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutWhatsApp } from '../../src/controllers/checkout.controller.js';
import carrinhoService from '../../src/services/carrinho.service.js';
import prisma from '../../src/config/database.js';

// 1. Mock do Prisma (Banco de dados)
// Necessário porque o carrinhoService consulta o banco ao adicionar itens
vi.mock('../../src/config/database.js', () => ({
  default: {
    perfume: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Integration: Checkout WhatsApp Controller', () => {
  // Helpers para simular objetos do Express
  const mockResponse = () => {
    const res = {};
    res.redirect = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (body) => ({
    body,
  });

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve gerar o link e redirecionar para o WhatsApp com sucesso', async () => {
    // 1. Criar um carrinho real (na memória do serviço)
    const carrinho = carrinhoService.criarCarrinho();
    
    // 2. Mockar o produto no banco de dados para poder adicionar ao carrinho
    const perfumeMock = {
      id: 101,
      nome: 'Perfume Jest',
      preco: 150.00,
      quantidade_estoque: 10,
      vendedorId: 99,
      foto: 'url_foto',
    };
    prisma.perfume.findUnique.mockResolvedValue(perfumeMock);

    // 3. Adicionar item ao carrinho usando o serviço real
    await carrinhoService.adicionarItem(carrinho.id, 101, 2);

    const req = mockRequest({
      nome: 'João Silva',
      telefone: '11999998888',
      carrinhoId: carrinho.id,
    });
    const res = mockResponse();

    await checkoutWhatsApp(req, res, mockNext);

    // Verifica se não houve erro
    expect(mockNext).not.toHaveBeenCalled();

    // Verifica se o redirect foi chamado
    expect(res.redirect).toHaveBeenCalledTimes(1);

    // Analisa a URL gerada
    const redirectUrl = res.redirect.mock.calls[0][0];
    const urlObj = new URL(redirectUrl);
    const params = urlObj.searchParams;

    // 1. Validar estrutura da URL
    expect(redirectUrl).toContain('wa.me/5511999998888');

    // 2. Validar conteúdo da mensagem decodificada
    const mensagemGerada = params.get('text');
    
    expect(mensagemGerada).toContain('Olá, meu nome é João Silva');
    expect(mensagemGerada).toContain('2x Perfume Jest - R$ 150.00'); // Item
    expect(mensagemGerada).toContain('Total: R$ 300.00'); // Total calculado corretamente
  });

  it('deve retornar erro 400 se o carrinho estiver vazio', async () => {
    const carrinho = carrinhoService.criarCarrinho();

    const req = mockRequest({
      nome: 'Maria',
      telefone: '11999998888',
      carrinhoId: carrinho.id,
    });
    const res = mockResponse();

    await checkoutWhatsApp(req, res, mockNext);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    
    // Verifica se o erro passado para o next é o esperado
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/carrinho está vazio/i);
    expect(error.statusCode).toBe(400);
  });

  it('deve retornar erro 404 se o carrinho não existir', async () => {
    const fakeId = 'carrinho_inexistente_123';

    const req = mockRequest({
      nome: 'Teste',
      telefone: '1100000000',
      carrinhoId: fakeId,
    });
    const res = mockResponse();

    await checkoutWhatsApp(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error.message).toMatch(/Carrinho não encontrado/i);
    expect(error.statusCode).toBe(404);
  });

  it('deve formatar corretamente telefone incompleto (sem DDD explícito na entrada)', async () => {
    // Testa se a formatação "55" é aplicada na integração
    const carrinho = carrinhoService.criarCarrinho();
    
    prisma.perfume.findUnique.mockResolvedValue({
      id: 202,
      nome: 'Perfume Format',
      preco: 50.00,
      quantidade_estoque: 5,
      vendedorId: 50,
    });

    await carrinhoService.adicionarItem(carrinho.id, 202, 1);

    const req = mockRequest({
      nome: 'Formatador',
      telefone: '31988887777', // 11 dígitos
      carrinhoId: carrinho.id,
    });
    const res = mockResponse();

    await checkoutWhatsApp(req, res, mockNext);

    const redirectUrl = res.redirect.mock.calls[0][0];
    // Deve adicionar o 55 automaticamente
    expect(redirectUrl).toContain('wa.me/5531988887777');
  });
});