import prisma from '../config/database.js';

export const buscarPerfumes = async (filtros) => {
  const { 
    cidade, 
    estado, 
    termo, 
    precoMin, 
    precoMax, 
    ordenar, 
    pagina = 1, 
    limite = 10 
  } = filtros;

  // 1. Construção do objeto 'where' dinâmico
  const where = {
    // Filtro de localidade
    vendedor: {
      cidade: { equals: cidade, mode: 'insensitive' },
      estado: { equals: estado, mode: 'insensitive' }
    }
  };

  // Filtro apenas por NOME (Case insensitive)
  if (termo) {
    where.nome = { contains: termo, mode: 'insensitive' };
  }
  
  // Filtro de intervalo de preço
  if (precoMin || precoMax) {
    where.preco = {};
    if (precoMin) where.preco.gte = Number(precoMin);
    if (precoMax) where.preco.lte = Number(precoMax);
  }

  // 2. Definição da Ordenação
  let orderBy = {};
  switch (ordenar) {
    case 'menor_preco':
      orderBy = { preco: 'asc' };
      break;
    case 'maior_preco':
      orderBy = { preco: 'desc' };
      break;
    case 'mais_vendidos':
    default:
      orderBy = { pedidoItens: { _count: 'desc' } };
      break;
  }

  // 3. Execução da Query com Paginação
  const skip = (Number(pagina) - 1) * Number(limite);
  const take = Number(limite);

  const totalItens = await prisma.perfume.count({ where });

  const produtos = await prisma.perfume.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      vendedor: {
        select: {
          nome_loja: true,
          cidade: true,
          estado: true
        }
      }
    }
  });

  return {
    produtos,
    paginacao: {
      total: totalItens,
      paginaAtual: pagina,
      totalPaginas: Math.ceil(totalItens / limite),
      itensPorPagina: limite
    }
  };
};

export default {
  buscarPerfumes,
};