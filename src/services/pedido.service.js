import prisma from '../config/database.js';
import { AppError } from '../utils/appError.js';
import * as whatsappUtils from '../utils/whatsapp.js';

export const criarPedido = async ({ nomeCliente, telefoneCliente, carrinho }) => {
  if (!carrinho || !carrinho.items || carrinho.items.length === 0) {
    throw new AppError('Carrinho inválido ou vazio', 400);
  }

  const vendedorId = carrinho.vendorId;
  if (!vendedorId) throw new AppError('Carrinho sem vendedor associado', 400);

  return await prisma.$transaction(async (tx) => {
    // 1. Revalidação de estoque
    for (const item of carrinho.items) {
      const p = await tx.perfume.findUnique({ where: { id: Number(item.perfumeId) } });
      if (!p) throw new AppError(`Produto ${item.perfumeId} não encontrado`, 404);
      if (p.quantidade_estoque < item.quantidade) {
        throw new AppError(`Estoque insuficiente para ${p.nome}`, 400);
      }
    }

    // 2. Criar pedido com itens (Primeiro salvamos para gerar o ID e pegar o Vendedor)
    const pedidoCriado = await tx.pedido.create({
      data: {
        valor_total: carrinho.total,
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        vendedorId: carrinho.vendorId,
        mensagem_whatsapp: '', // Será atualizado logo abaixo
        enviado_whatsapp: false,
        itens: {
          create: carrinho.items.map((it) => ({
            quantidade: it.quantidade,
            preco_unitario: it.preco,
            perfume: { connect: { id: Number(it.perfumeId) } },
          })),
        },
      },
      include: { 
        itens: true, 
        vendedor: true
      },
    });

    // 3. Diminuir estoque
    for (const item of carrinho.items) {
      await tx.perfume.update({
        where: { id: Number(item.perfumeId) },
        data: { quantidade_estoque: { decrement: Number(item.quantidade) } },
      });
    }

    // Aqui usamos os dados do banco (pedidoCriado) para garantir integridade
    const mensagemFinal = whatsappUtils.gerarMensagemDoCarrinho({
      nomeCliente: nomeCliente,
      telefoneCliente: telefoneCliente,
      nomeVendedor: pedidoCriado.vendedor.nome,
      items: carrinho.items,
      valorTotal: carrinho.total,
      pedidoId: pedidoCriado.id
    });

    // 5. Gerar Link e Atualizar o Pedido
    const telefoneVendedor = whatsappUtils.formatarTelefone(pedidoCriado.vendedor.telefone);
    const whatsappLink = whatsappUtils.gerarLinkWhatsApp({ 
      telefoneFormatado: telefoneVendedor, 
      mensagem: mensagemFinal 
    });

    // Salva a mensagem final gerada no banco para histórico
    const pedidoAtualizado = await tx.pedido.update({ 
      where: { id: pedidoCriado.id }, 
      data: { mensagem_whatsapp: mensagemFinal } 
    });

    return { ...pedidoAtualizado, whatsapp_link: whatsappLink };
  });
};

export const listarPedidos = async (vendedorId) => {
  return prisma.pedido.findMany({
    where: { vendedorId: Number(vendedorId) },
    include: { itens: { include: { perfume: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const buscarPorId = async (id, vendedorId) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { itens: { include: { perfume: true } }, vendedor: true },
  });
  if (!pedido) throw new AppError('Pedido não encontrado', 404);
  if (vendedorId && pedido.vendedorId !== Number(vendedorId)) {
    throw new AppError('Acesso negado ao pedido', 403);
  }
  return pedido;
};

export const atualizarStatus = async (id, vendedorId, status) => {
  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) throw new AppError('Pedido não encontrado', 404);
  if (pedido.vendedorId !== Number(vendedorId)) throw new AppError('Acesso negado', 403);

  const atualizado = await prisma.pedido.update({ where: { id }, data: { status } });
  return atualizado;
};

export const atualizarPedido = async (id, vendedorId, data) => {
  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) throw new AppError('Pedido não encontrado', 404);
  if (pedido.vendedorId !== Number(vendedorId)) throw new AppError('Acesso negado', 403);

  const campos = {};
  if (data.nome_cliente) campos.nome_cliente = data.nome_cliente;
  if (data.telefone_cliente) campos.telefone_cliente = data.telefone_cliente;

  return prisma.pedido.update({ where: { id }, data: campos });
};

export default {
  criarPedido,
  listarPedidos,
  buscarPorId,
  atualizarStatus,
  atualizarPedido,
};