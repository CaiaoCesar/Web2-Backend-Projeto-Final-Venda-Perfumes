import prisma from '../config/database.js';
import { uploadImgUploadcare, apagaDoUploadCare } from './upload.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * Auxiliar: Extrai o UUID do arquivo a partir da URL do Uploadcare
 */
const extrairUUID = (url) => {
  if (!url) return null;
  const partes = url.split('/');
  const uuid = partes[partes.length - 2];
  return uuid;
};

/**
 * Busca todos os perfumes do vendedor com filtros e paginação
 */
export const listarPerfumes = async (vendedorId, filtros = {}) => {
  const { nome, page = 1, limit = 10 } = filtros;
  
  const where = { vendedorId };
  
  if (nome) {
    where.nome = {
      contains: nome,
      mode: 'insensitive'
    };
  }
  
  const skip = (page - 1) * limit;
  
  const [perfumes, total] = await Promise.all([
    prisma.perfume.findMany({
      where,
      select: {
        id: true,
        nome: true,
        marca: true,
        foto: true,
        preco: true,
        quantidade_estoque: true,
        descricao: true,
        frasco: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.perfume.count({ where })
  ]);
  
  return { perfumes, total };
};

/**
 * Cria um novo perfume (Valida nome duplicado: 400)
 */
export const criarPerfume = async (perfumeDados, file = null, vendedorId) => {
  const perfumeJaCadastrado = await prisma.perfume.findFirst({
    where: { 
      nome: perfumeDados.nome,
      vendedorId: vendedorId,
    },
  });

  if (perfumeJaCadastrado) {
    throw new AppError('Você já possui um perfume cadastrado com este nome.', 400);
  }

  let fotoUrl = null; 
  if (file) {
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
  }

  return await prisma.perfume.create({
    data: {
      nome: perfumeDados.nome,
      marca: perfumeDados.marca,
      descricao: perfumeDados.descricao,
      foto: fotoUrl || perfumeDados.foto || null,
      vendedorId: vendedorId,
      quantidade_estoque: Number(perfumeDados.quantidade_estoque) || 0,
      preco: parseFloat(perfumeDados.preco),
      frasco: parseFloat(perfumeDados.frasco),
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      foto: true,
      marca: true,
      preco: true,
      vendedorId: true,
      createdAt: true,
    },
  });
};

/**
 * Atualiza um perfume (Valida existência: 404 | Propriedade: 403)
 */
export const atualizarPerfume = async (id, perfumeDados, file = null, vendedorId) => {
  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new AppError(`Perfume com ID ${id} não encontrado`, 404);
  }
  
  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new AppError('Perfume com ID ${id} não encontrado', 403);
  }

  let fotoUrl = null; 
  if (file) {
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
    if (fotoUrl && perfumeExistente.foto) {
        const uuidAntigo = extrairUUID(perfumeExistente.foto);
        if (uuidAntigo) await apagaDoUploadCare(uuidAntigo);
    }
  }

  const dadosParaAtualizar = {
    nome: perfumeDados.nome,
    marca: perfumeDados.marca,
    descricao: perfumeDados.descricao,
    quantidade_estoque: perfumeDados.quantidade_estoque ? Number(perfumeDados.quantidade_estoque) : undefined,
    preco: perfumeDados.preco ? parseFloat(perfumeDados.preco) : undefined,
    frasco: perfumeDados.frasco ? parseFloat(perfumeDados.frasco) : undefined,
  };

  if (fotoUrl) dadosParaAtualizar.foto = fotoUrl;

  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: dadosParaAtualizar,
  });
};

/**
 * Atualiza apenas o estoque (Valida existência: 404 | Propriedade: 403)
 */
export const atualizarEstoquePerfume = async (id, perfumeDados, vendedorId) => {
  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new AppError(`Perfume com ID ${id} não encontrado`, 404);
  }

  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new AppError('Perfume com ID ${id} não encontrado', 403);
  }

  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: {
      quantidade_estoque: Number(perfumeDados.quantidade_estoque),
    },
    select: {
      id: true,
      nome: true,
      quantidade_estoque: true,
      updatedAt: true,
    },
  });
};

/**
 * Remove um perfume (Valida existência: 404 | Propriedade: 403)
 */
export const excluirPerfume = async (id, vendedorId) => {
  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new AppError(`Perfume com ID ${id} não encontrado`, 404);
  }
  
  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new AppError('Perfume com ID ${id} não encontrado', 403);
  }

  if (perfumeExistente.foto) {
    const uuid = extrairUUID(perfumeExistente.foto);
    if (uuid) await apagaDoUploadCare(uuid);
  }

  return await prisma.perfume.delete({
    where: { id: perfumeId },
  });
};

export default {
  listarPerfumes,
  criarPerfume,
  atualizarPerfume,
  atualizarEstoquePerfume,
  excluirPerfume,
};