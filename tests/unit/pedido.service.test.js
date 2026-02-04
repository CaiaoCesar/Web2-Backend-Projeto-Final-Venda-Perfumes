import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pedidoService from '../../src/services/pedido.service.js'; // Ajuste o caminho conforme necessário
import prisma from '../../src/config/database.js';
import * as whatsappUtils from '../../src/utils/whatsapp.js';

// 1. Mock das dependências
vi.mock('../../src/config/database.js', () => ({
  default: {
    $transaction: vi.fn(),
    pedido: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    perfume: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/whatsapp.js', () => ({
  gerarMensagemDoCarrinho: vi.fn(),
  formatarTelefone: vi.fn(),
  gerarLinkWhatsApp: vi.fn(),
}));

describe('Pedido Service', () => {
  // Limpar os mocks antes de cada teste para evitar contaminação
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('criarPedido', () => {
    const mockCarrinho = {
      vendorId: 1,
      total: 100,
      items: [
        { perfumeId: 10, quantidade: 2, preco: 50 },
      ],
    };
    const mockCliente = { nomeCliente: 'João', telefoneCliente: '11999999999' };

    it('deve lançar erro se o carrinho for inválido ou vazio', async () => {
      await expect(pedidoService.criarPedido({ ...mockCliente, carrinho: null }))
        .rejects.toThrow('Carrinho inválido ou vazio');
        
      await expect(pedidoService.criarPedido({ ...mockCliente, carrinho: { items: [] } }))
        .rejects.toThrow('Carrinho inválido ou vazio');
    });

    it('deve lançar erro se não houver vendedor associado', async () => {
      const carrinhoSemVendor = { ...mockCarrinho, vendorId: null };
      await expect(pedidoService.criarPedido({ ...mockCliente, carrinho: carrinhoSemVendor }))
        .rejects.toThrow('Carrinho sem vendedor associado');
    });

    it('deve criar um pedido com sucesso dentro de uma transação', async () => {
      // A transação recebe um callback e nós o executamos passando o próprio objeto prisma mockado como 'tx'
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

      // Mock dos dados de retorno
      const mockPerfume = { id: 10, nome: 'Perfume X', quantidade_estoque: 10 };
      const mockPedidoCriado = { 
        id: 1, 
        vendedor: { nome: 'Vendedor Teste', telefone: '11888888888' } 
      };
      
      prisma.perfume.findUnique.mockResolvedValue(mockPerfume);
      prisma.pedido.create.mockResolvedValue(mockPedidoCriado);
      prisma.perfume.update.mockResolvedValue({}); 
      prisma.pedido.update.mockResolvedValue({ ...mockPedidoCriado, mensagem_whatsapp: 'Msg' });
      
      whatsappUtils.gerarMensagemDoCarrinho.mockReturnValue('Mensagem Formatada');
      whatsappUtils.formatarTelefone.mockReturnValue('5511888888888');
      whatsappUtils.gerarLinkWhatsApp.mockReturnValue('https://wa.me/xxx');

      const result = await pedidoService.criarPedido({ ...mockCliente, carrinho: mockCarrinho });

      expect(prisma.$transaction).toHaveBeenCalled();
      
      // 1. Verifica checagem de estoque
      expect(prisma.perfume.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
      
      // 2. Verifica criação do pedido
      expect(prisma.pedido.create).toHaveBeenCalled();
      
      // 3. Verifica baixa de estoque
      expect(prisma.perfume.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { quantidade_estoque: { decrement: 2 } }
      });

      // 4. Verifica geração de msg e link
      expect(whatsappUtils.gerarMensagemDoCarrinho).toHaveBeenCalled();
      expect(whatsappUtils.gerarLinkWhatsApp).toHaveBeenCalled();

      // 5. Verifica retorno final
      expect(result).toHaveProperty('whatsapp_link', 'https://wa.me/xxx');
    });

    it('deve lançar erro se o produto não for encontrado (dentro da tx)', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.perfume.findUnique.mockResolvedValue(null); // Produto não existe

      await expect(pedidoService.criarPedido({ ...mockCliente, carrinho: mockCarrinho }))
        .rejects.toThrow('Produto 10 não encontrado');
    });

    it('deve lançar erro se o estoque for insuficiente (dentro da tx)', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      // Estoque 1, mas quer comprar 2
      prisma.perfume.findUnique.mockResolvedValue({ id: 10, nome: 'Perfume X', quantidade_estoque: 1 });

      await expect(pedidoService.criarPedido({ ...mockCliente, carrinho: mockCarrinho }))
        .rejects.toThrow('Estoque insuficiente para Perfume X');
    });
  });

  describe('listarPedidos', () => {
    it('deve listar pedidos de um vendedor específico', async () => {
      const mockPedidos = [{ id: 1 }, { id: 2 }];
      prisma.pedido.findMany.mockResolvedValue(mockPedidos);

      const result = await pedidoService.listarPedidos(5);

      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: { vendedorId: 5 },
        include: { itens: { include: { perfume: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPedidos);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar o pedido se encontrado e pertencer ao vendedor', async () => {
      const mockPedido = { id: 1, vendedorId: 5 };
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);

      const result = await pedidoService.buscarPorId(1, 5);
      expect(result).toEqual(mockPedido);
    });

    it('deve lançar erro 404 se o pedido não existir', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);
      await expect(pedidoService.buscarPorId(99, 5))
        .rejects.toThrow('Pedido não encontrado');
    });

    it('deve lançar erro 403 se o pedido pertencer a outro vendedor', async () => {
      const mockPedido = { id: 1, vendedorId: 999 }; // Outro ID
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);

      await expect(pedidoService.buscarPorId(1, 5))
        .rejects.toThrow('Acesso negado ao pedido');
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status se as credenciais forem válidas', async () => {
      const mockPedido = { id: 1, vendedorId: 5, status: 'PENDENTE' };
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);
      prisma.pedido.update.mockResolvedValue({ ...mockPedido, status: 'ENTREGUE' });

      const result = await pedidoService.atualizarStatus(1, 5, 'ENTREGUE');

      expect(prisma.pedido.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ENTREGUE' }
      });
      expect(result.status).toBe('ENTREGUE');
    });

    it('deve bloquear atualização de status se vendedor for incorreto', async () => {
      const mockPedido = { id: 1, vendedorId: 999 }; 
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);

      await expect(pedidoService.atualizarStatus(1, 5, 'ENTREGUE'))
        .rejects.toThrow('Acesso negado');
    });
  });

  describe('atualizarPedido', () => {
    it('deve atualizar apenas campos permitidos (nome, telefone)', async () => {
      const mockPedido = { id: 1, vendedorId: 5, nome_cliente: 'Antigo' };
      prisma.pedido.findUnique.mockResolvedValue(mockPedido);
      prisma.pedido.update.mockResolvedValue({ ...mockPedido, nome_cliente: 'Novo' });

      const dadosParaAtualizar = { 
        nome_cliente: 'Novo', 
        campo_invalido: 'Hack' // Deve ser ignorado pelo service
      };

      await pedidoService.atualizarPedido(1, 5, dadosParaAtualizar);

      expect(prisma.pedido.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nome_cliente: 'Novo' } // Verifica que campo_invalido não foi passado
      });
    });
  });
});