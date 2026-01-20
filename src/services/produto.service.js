// src/services/produto.service.js
import prisma from '../config/database.js';
import { uploadImgUploadcare, apagaDoUploadCare } from './upload.service.js';

// Extrai o UUID do arquivo a partir da URL do Uploadcare
// Ex: https://ucarecdn.com/uuid-aqui/ -> retorna "uuid-aqui"
const extrairUUID = (url) => {
  if (!url) return null;
  const partes = url.split('/');
  // Se a URL termina com /nome.webp, o UUID é o 2º elemento de trás pra frente
  // Se a URL termina com /, o UUID também costuma ser o 2º elemento
  const uuid = partes[partes.length - 2];
  console.log(`[DEBUG] UUID Extraído para deleção: ${uuid}`); // Log para conferir no terminal
  return uuid;
};

/**
 * Busca todos os perfumes do sistema
 */
export const listarPerfumes = async () => {
  return await prisma.perfume.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Verifica se um perfume já está cadastrado pelo nome
 */
const perfumeExiste = async (nome) => {
  const perfume = await prisma.perfume.findFirst({
    where: { nome: nome },
  });
  return !!perfume;
};

/**
 * Cria um novo perfume
 */
export const criarPerfume = async (perfumeDados, file = null) => {
  // 1. Verificar regra de negócio 
  const verificaPerfumeExiste = await perfumeExiste(perfumeDados.nome);
  if (verificaPerfumeExiste) {
    throw new Error('Perfume já cadastrado no sistema');
  }

  // 2. Upload da foto
  let fotoUrl = null; 
  if (file) {
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
  }

  // 3. Criar no banco
  return await prisma.perfume.create({
    data: {
      nome: perfumeDados.nome,
      marca: perfumeDados.marca,
      quantidade_estoque: perfumeDados.quantidade_estoque,
      foto: fotoUrl || perfumeDados.foto || null,
      preco: perfumeDados.preco,
      descricao: perfumeDados.descricao,
      frasco: perfumeDados.frasco,
    },
    select: {
      id: true,
      nome: true,
      marca: true,
      quantidade_estoque: true,
      foto: true,
      preco: true,
      descricao: true,
      frasco: true,
      createdAt: true,
    },
  });
};

/**
 * Atualiza um perfume existente
 */
export const atualizarPerfume = async (id, perfumeDados, file = null) => {
  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) throw new Error(`Perfume com ID ${id} não encontrado`);

  let fotoUrl = null; 
  if (file) {
    // 1. Sobe a nova foto
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
    
    // 2. Apaga a foto antiga do servidor
    if (fotoUrl && perfumeExistente.foto) {
        const uuidAntigo = extrairUUID(perfumeExistente.foto);
        if (uuidAntigo) {
            await apagaDoUploadCare(uuidAntigo); // Limpa o "lixo" do Uploadcare
        }
    }
  }

  const dadosAtualizados = { ...perfumeDados };
  if (fotoUrl) dadosAtualizados.foto = fotoUrl;

  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: dadosAtualizados,
  });
};

/**
 * Atualiza o estoque de um perfume existente
 */
export const atualizarEstoquePerfume = async (id, perfumeDados) => {

  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: {
      quantidade_estoque: perfumeDados.quantidade_estoque,
    },
    select: {
      id: true,
      nome: true,
      quantidade_estoque: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Remove um perfume do sistema
 */
export const excluirPerfume = async (id) => {
  const perfumeId = Number(id);

  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) throw new Error(`Perfume com ID ${id} não encontrado`);

  // FIX: Implementação da deleção da foto ao excluir o produto
  if (perfumeExistente.foto) {
    const uuid = extrairUUID(perfumeExistente.foto);
    if (uuid) {
      console.log(`Limpando foto do produto excluído: ${uuid}`);
      await apagaDoUploadCare(uuid);
    }
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