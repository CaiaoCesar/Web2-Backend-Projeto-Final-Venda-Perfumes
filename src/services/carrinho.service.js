import prisma from '../config/database.js';
import { AppError } from '../utils/appError.js';

const carrinhos = new Map();

const gerarId = () => `carrinho_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const calcularTotal = (items) => {
  return items.reduce((acc, it) => acc + it.preco * it.quantidade, 0);
};

export const criarCarrinho = (initialItems = []) => {
  const id = gerarId();
  const carrinho = {
    id,
    vendorId: null,
    // Usa os items iniciais se fornecidos, senão array vazio
    items: initialItems,
    total: calcularTotal(initialItems),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  carrinhos.set(id, carrinho);

  return carrinho;
};

export const verCarrinho = (carrinhoId) => {
  const carrinho = carrinhos.get(carrinhoId);
  if (!carrinho) throw new AppError('Carrinho não encontrado', 404);
  return carrinho;
};

export const adicionarItem = async (carrinhoId, perfumeId, quantidade = 1) => {
  const carrinho = carrinhos.get(carrinhoId);

  // Não criar carrinho automaticamente se o ID informado não existir.
  // Isso evita confusão no Frontend entre IDs antigos e novos.
  if (!carrinho) {
    throw new AppError('Carrinho não encontrado. Crie um novo carrinho primeiro.', 404);
  }

  const qtdNumber = Number(quantidade);
  if (isNaN(qtdNumber) || qtdNumber < 1) {
    throw new AppError('Quantidade deve ser um número válido e pelo menos 1', 400);
  }

  const perfume = await prisma.perfume.findUnique({
    where: { id: Number(perfumeId) },
    select: {
      id: true,
      nome: true,
      preco: true,
      quantidade_estoque: true,
      foto: true,
      vendedorId: true,
    },
  });

  if (!perfume) throw new AppError('Perfume não encontrado', 404);

  if (carrinho.vendorId && carrinho.vendorId !== perfume.vendedorId) {
    throw new AppError('O carrinho só pode conter produtos de um único vendedor', 400);
  }

  if (qtdNumber > perfume.quantidade_estoque) {
    throw new AppError('Quantidade solicitada maior que o estoque disponível', 400);
  }

  const existing = carrinho.items.find((i) => i.perfumeId === perfume.id);

  if (existing) {
    const novaQuantidade = existing.quantidade + qtdNumber;
    if (novaQuantidade > perfume.quantidade_estoque) {
      throw new AppError('Quantidade total excede o estoque disponível', 400);
    }
    existing.quantidade = novaQuantidade;
  } else {
    carrinho.items.push({
      perfumeId: perfume.id,
      nome: perfume.nome,
      preco: perfume.preco,
      quantidade: qtdNumber,
      foto: perfume.foto,
      vendedorId: perfume.vendedorId,
    });

    // Atribuir vendedor ao carrinho se for o primeiro item
    if (!carrinho.vendorId) carrinho.vendorId = perfume.vendedorId;
  }

  carrinho.total = calcularTotal(carrinho.items);
  carrinho.updatedAt = new Date().toISOString();
  carrinhos.set(carrinho.id, carrinho);

  return carrinho;
};

export const atualizarQuantidade = async (carrinhoId, perfumeId, quantidade) => {
  const carrinho = carrinhos.get(carrinhoId);
  if (!carrinho) throw new AppError('Carrinho não encontrado', 404);

  const idx = carrinho.items.findIndex((i) => i.perfumeId === Number(perfumeId));
  if (idx === -1) throw new AppError('Item não encontrado no carrinho', 404);

  const qtdNumber = Number(quantidade);
  if (isNaN(qtdNumber)) throw new AppError('Quantidade inválida', 400);

  const perfume = await prisma.perfume.findUnique({ where: { id: Number(perfumeId) } });
  if (!perfume) throw new AppError('Produto original não encontrado', 404);

  if (qtdNumber < 1) {
    // Remove item se quantidade for menor que 1
    carrinho.items.splice(idx, 1);
  } else {
    if (qtdNumber > perfume.quantidade_estoque) {
      throw new AppError('Quantidade solicitada maior que o estoque disponível', 400);
    }
    carrinho.items[idx].quantidade = qtdNumber;
  }

  // Se o carrinho ficar vazio, reseta o vendedor para permitir compras de outros
  if (carrinho.items.length === 0) carrinho.vendorId = null;

  carrinho.total = calcularTotal(carrinho.items);
  carrinho.updatedAt = new Date().toISOString();
  carrinhos.set(carrinho.id, carrinho);

  return carrinho;
};

export const removerItem = (carrinhoId, perfumeId) => {
  const carrinho = carrinhos.get(carrinhoId);
  if (!carrinho) throw new AppError('Carrinho não encontrado', 404);

  const idx = carrinho.items.findIndex((i) => i.perfumeId === Number(perfumeId));
  if (idx === -1) throw new AppError('Item não encontrado no carrinho', 404);

  carrinho.items.splice(idx, 1);

  if (carrinho.items.length === 0) carrinho.vendorId = null;

  carrinho.total = calcularTotal(carrinho.items);
  carrinho.updatedAt = new Date().toISOString();
  carrinhos.set(carrinho.id, carrinho);

  return carrinho;
};

export const limparCarrinho = (carrinhoId) => {
  const carrinho = carrinhos.get(carrinhoId);
  if (!carrinho) throw new AppError('Carrinho não encontrado', 404);

  carrinho.items = [];
  carrinho.vendorId = null;
  carrinho.total = 0;
  carrinho.updatedAt = new Date().toISOString();
  carrinhos.set(carrinho.id, carrinho);

  return carrinho;
};

export default {
  criarCarrinho,
  verCarrinho,
  adicionarItem,
  atualizarQuantidade,
  removerItem,
  limparCarrinho,
};
