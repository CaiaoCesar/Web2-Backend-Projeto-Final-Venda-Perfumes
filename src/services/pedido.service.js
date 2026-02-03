import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import * as carrinhoService from './carrinho.service.js';

const prisma = new PrismaClient();

/**
 * Cria um pedido a partir do carrinho do cliente.
 * Valida estoque, calcula o total e persiste numa transação única.
 */
export async function criarPedido({ vendedorId, nome, telefone, carrinhoId }) {
  // 1. Buscar carrinho no servidor
  const carrinho = carrinhoService.verCarrinho(carrinhoId);

  if (!carrinho.items || carrinho.items.length === 0) {
    throw new AppError('O carrinho está vazio.', 400);
  }

  // 2. Buscar perfumes no banco e validar estoque
  const perfumesEncontrados = await Promise.all(
    carrinho.items.map((item) =>
      prisma.perfume.findFirst({
        where: { id: item.perfumeId, vendedorId },
      })
    )
  );

  for (let i = 0; i < carrinho.items.length; i++) {
    const perfume = perfumesEncontrados[i];
    const item = carrinho.items[i];

    if (!perfume) {
      throw new AppError(
        `Perfume com ID ${item.perfumeId} não encontrado ou não pertence ao vendedor.`,
        400
      );
    }

    if (perfume.quantidade_estoque < item.quantidade) {
      throw new AppError(
        `Estoque insuficiente para "${perfume.nome}". Disponível: ${perfume.quantidade_estoque}, solicitado: ${item.quantidade}.`,
        400
      );
    }
  }

  // 3. Calcular valor total usando o preço do banco
  const valor_total = carrinho.items.reduce((soma, item, i) => {
    return soma + perfumesEncontrados[i].preco * item.quantidade;
  }, 0);

  // 4. Montar mensagem WhatsApp
  const telefoneFormatado = telefone.replace(/[^0-9]/g, '');

  const linhasItens = carrinho.items.map((item, i) => {
    const perfume = perfumesEncontrados[i];
    const subtotal = perfume.preco * item.quantidade;
    return `${item.quantidade}x ${perfume.nome} (${perfume.marca}) - R$ ${subtotal.toFixed(2)}`;
  });

  const mensagem_whatsapp = [
    `Novo Pedido Recebido`,
    ``,
    `Cliente: ${nome}`,
    `Telefone: ${telefoneFormatado}`,
    ``,
    `Produtos:`,
    ...linhasItens,
    ``,
    `Total: R$ ${valor_total.toFixed(2)}`,
    ``,
    `Status: Pendente`,
  ].join('\n');

  // 5. Criar pedido, itens e decrementar estoque numa transação
  const pedido = await prisma.$transaction(async (tx) => {
    const pedidoCriado = await tx.pedido.create({
      data: {
        vendedorId,
        nome_cliente: nome,
        telefone_cliente: telefoneFormatado,
        valor_total,
        mensagem_whatsapp,
        itens: {
          createMany: {
            data: carrinho.items.map((item, i) => ({
              perfumeId: item.perfumeId,
              quantidade: item.quantidade,
              preco_unitario: perfumesEncontrados[i].preco,
            })),
          },
        },
      },
      include: {
        itens: { include: { perfume: true } },
      },
    });

    // Decrementar estoque de cada perfume
    await Promise.all(
      carrinho.items.map((item) =>
        tx.perfume.update({
          where: { id: item.perfumeId },
          data: { quantidade_estoque: { decrement: item.quantidade } },
        })
      )
    );

    return pedidoCriado;
  });

  return pedido;
}

/**
 * Retorna pedidos do vendedor, com filtro opcional por status.
 */
export async function listarPedidos(vendedorId, filtroStatus) {
  return prisma.pedido.findMany({
    where: {
      vendedorId,
      ...(filtroStatus && { status: filtroStatus }),
    },
    include: {
      itens: { include: { perfume: true } },
    },
    orderBy: { data_pedido: 'desc' },
  });
}

/**
 * Busca um pedido pelo ID, validando que pertence ao vendedor.
 */
export async function buscarPedido(pedidoId, vendedorId) {
  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, vendedorId },
    include: {
      itens: { include: { perfume: true } },
    },
  });

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  return pedido;
}

/**
 * Atualiza o status do pedido.
 * Transição permitida: PENDENTE → CONFIRMADO.
 */
export async function atualizarStatusPedido(pedidoId, vendedorId, novoStatus) {
  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, vendedorId },
  });

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  if (pedido.status === 'CONFIRMADO' && novoStatus === 'PENDENTE') {
    throw new AppError('Não é possível voltar um pedido confirmado para pendente.', 400);
  }

  if (pedido.status === novoStatus) {
    throw new AppError(`O pedido já está no status "${novoStatus}".`, 400);
  }

  const pedidoAtualizado = await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status: novoStatus },
    include: {
      itens: { include: { perfume: true } },
    },
  });

  return pedidoAtualizado;
}

/**
 * Marca a mensagem WhatsApp do pedido como enviada.
 */
export async function marcarWhatsappEnviado(pedidoId) {
  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  return prisma.pedido.update({
    where: { id: pedidoId },
    data: { enviado_whatsapp: true },
  });
}

export default {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatusPedido,
  marcarWhatsappEnviado,
};