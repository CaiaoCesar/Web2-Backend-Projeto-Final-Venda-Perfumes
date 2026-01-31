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
 * Busca todos os perfumes do vendedor
 */
export const listarPerfumes = async (vendedorId) => {
  console.log("Este é o vendedor ",vendedorId);
  return await prisma.perfume.findMany({
    where: { 
      vendedorId: vendedorId // Filtra apenas os perfumes deste dono
    }, 
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
 * Cria um novo perfume
 */
export const criarPerfume = async (perfumeDados, file = null, vendedorId) => {
  // 1. Verificar se o vendedor já possui um perfume com este nome
  const perfumeJaCadastrado = await prisma.perfume.findFirst({
    where: { 
      nome: perfumeDados.nome,
      vendedorId: vendedorId,
    },
  });

  // Corrigido: Verificamos a constante acima e não damos 'return' ainda
  if (perfumeJaCadastrado) {
    throw new Error('Você já possui um perfume cadastrado com este nome.');
  }

  // 2. Upload da foto
  let fotoUrl = null; 
  if (file) {
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
  }

  // 3. Criar no banco com as conversões de tipo necessárias
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
      marca: true,
      preco: true,
      vendedorId: true,
      createdAt: true,
    },
  });
};

/**
 * Atualiza um perfume existente
 */
export const atualizarPerfume = async (id, perfumeDados, file = null, vendedorId) => {
  const perfumeId = Number(id);

  // 1. Busca o perfume para verificar quem é o dono
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) throw new Error(`Perfume com ID ${id} não encontrado`);
  
  // SEGURANÇA: O vendedor só pode editar o que é DELE
  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 2. Lógica de Upload
  let fotoUrl = null; 
  if (file) {
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
    if (fotoUrl && perfumeExistente.foto) {
        const uuidAntigo = extrairUUID(perfumeExistente.foto);
        if (uuidAntigo) await apagaDoUploadCare(uuidAntigo);
    }
  }

  // 3. Conversão de tipos para o Prisma
  // Lembre-se: no multipart/form-data, tudo chega como String
  const dadosParaAtualizar = {
    nome: perfumeDados.nome,
    marca: perfumeDados.marca,
    descricao: perfumeDados.descricao,
    quantidade_estoque: perfumeDados.quantidade_estoque ? Number(perfumeDados.quantidade_estoque) : undefined,
    preco: perfumeDados.preco ? parseFloat(perfumeDados.preco) : undefined,
    frasco: perfumeDados.frasco ? parseFloat(perfumeDados.frasco) : undefined,
  };

  if (fotoUrl) dadosParaAtualizar.foto = fotoUrl;

  // 4. Update final no banco
  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: dadosParaAtualizar,
  });
};

/**
 * Atualiza o estoque de um perfume existente
 */
export const atualizarEstoquePerfume = async (id, perfumeDados, vendedorId) => {
  const perfumeId = Number(id);

  // 1. Busca o perfume para verificar o dono
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  // 2. Validações de existência e segurança
  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 3. Executa a atualização com a conversão de tipo
  return await prisma.perfume.update({
    where: { id: perfumeId },
    data: {
      // Garante que o valor seja um número inteiro para o Prisma
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
 * Remove um perfume do sistema
 */
export const excluirPerfume = async (id, vendedorId) => {
  const perfumeId = Number(id);

  // 1. Busca o perfume para verificar a propriedade
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  // 2. Validações de segurança
  if (!perfumeExistente) throw new Error(`Perfume com ID ${id} não encontrado`);
  
  if (perfumeExistente.vendedorId !== vendedorId) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 3. Limpeza do Uploadcare: apaga a foto do servidor se ela existir
  if (perfumeExistente.foto) {
    const uuid = extrairUUID(perfumeExistente.foto);
    if (uuid) {
      console.log(`[DEBUG] Limpando foto do produto excluído: ${uuid}`);
      await apagaDoUploadCare(uuid); // Remove o arquivo do servidor externo
    }
  }

  // 4. Deleção final no banco de dados
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