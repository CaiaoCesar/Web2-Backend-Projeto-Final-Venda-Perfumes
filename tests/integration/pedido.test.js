import request from 'supertest';
import app from '../app.js'; // Sua instância do Express
import prisma from '../config/database.js';
import * as whatsappUtils from '../utils/whatsapp.js';

// Mocks de utilitários externos
jest.mock('../utils/whatsapp.js', () => ({
  gerarMensagemDoCarrinho: jest.fn(() => 'Mensagem de Teste'),
  formatarTelefone: jest.fn((t) => '5511999999999'),
  gerarLinkWhatsApp: jest.fn(() => 'http://wa.me/link-teste')
}));

// Mock do carrinhoService (para simular o estado da sessão/memória)
jest.mock('../services/carrinho.service.js', () => ({
  verCarrinho: jest.fn(),
  limparCarrinho: jest.fn()
}));

import * as carrinhoService from '../services/carrinho.service.js';

describe('Testes de Integração: Pedidos', () => {
  let vendedorId;
  let perfumeId;

  // Setup do banco de dados antes dos testes
  beforeAll(async () => {
    // Limpeza na ordem correta devido às chaves estrangeiras
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.perfume.deleteMany();
    await prisma.vendedor.deleteMany();

    // Criar dados necessários para o teste
    const vendedor = await prisma.vendedor.create({
      data: { nome: 'Vendedor Global', telefone: '11999999999', email: 'vendedor@teste.com' }
    });
    vendedorId = vendedor.id;

    const perfume = await prisma.perfume.create({
      data: { nome: 'Perfume Teste', preco: 100.0, quantidade_estoque: 10 }
    });
    perfumeId = perfume.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Fluxo Principal: Criar Pedido', () => {
    it('deve processar o pedido do controller ao banco e baixar estoque', async () => {
      // 1. Mock do estado do carrinho antes da chamada
      carrinhoService.verCarrinho.mockReturnValue({
        vendorId: vendedorId,
        total: 200.0,
        items: [{ perfumeId: perfumeId, quantidade: 2, preco: 100.0 }]
      });

      // 2. Disparo da requisição via Controller (HTTP)
      const response = await request(app)
        .post('/api/pedidos') // Ajuste para sua rota real
        .send({
          nome: 'Cliente de Teste',
          telefone: '11988887777',
          carrinhoId: 'carrinho-id-123'
        });

      // 3. Asserções de resposta (Controller)
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('whatsapp_link', 'http://wa.me/link-teste');

      // 4. Asserções de lógica de negócio (Service/DB)
      const pedidoNoBanco = await prisma.pedido.findUnique({
        where: { id: response.body.id },
        include: { itens: true }
      });

      expect(pedidoNoBanco.nome_cliente).toBe('Cliente de Teste');
      expect(pedidoNoBanco.itens).toHaveLength(1);

      // 5. Verificação da Transação (Baixa de Estoque)
      const perfumeAposVenda = await prisma.perfume.findUnique({ where: { id: perfumeId } });
      expect(perfumeAposVenda.quantidade_estoque).toBe(8); // Tinha 10, comprou 2

      // 6. Verificação do efeito colateral no Controller
      expect(carrinhoService.limparCarrinho).toHaveBeenCalledWith('carrinho-id-123');
    });

    it('deve retornar erro 400 se o estoque for insuficiente', async () => {
      carrinhoService.verCarrinho.mockReturnValue({
        vendorId: vendedorId,
        total: 2000.0,
        items: [{ perfumeId: perfumeId, quantidade: 50, preco: 100.0 }]
      });

      const response = await request(app)
        .post('/api/pedidos')
        .send({ nome: 'Erro', telefone: '000', carrinhoId: 'cart-123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Estoque insuficiente/);
    });
  });

  describe('Busca e Status', () => {
    it('deve permitir que o vendedor visualize seu próprio pedido', async () => {
      // Criamos um pedido direto no banco para testar a busca
      const novoPedido = await prisma.pedido.create({
        data: {
          nome_cliente: 'Busca Teste',
          vendedorId: vendedorId,
          valor_total: 50,
          mensagem_whatsapp: ''
        }
      });

      const response = await request(app)
        .get(`/api/pedidos/${novoPedido.id}`)
        // Simula middleware de autenticação definindo req.user
        .set('user-id', vendedorId); // Exemplo: se seu middleware ler header ou token

      expect(response.status).toBe(200);
      expect(response.body.nome_cliente).toBe('Busca Teste');
    });
  });
});