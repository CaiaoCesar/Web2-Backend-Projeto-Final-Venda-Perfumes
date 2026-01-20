// src/services/produto.service.js
import prisma from '../config/database.js';
import { uploadImgUploadcare } from './upload.service.js';

/**
 * Perfume Service
 * Responsável pela lógica de negócio relacionada aos perfumes
 */

/**
 * Busca todos os perfumes do sistema
 * @returns {Promise<Array>} Lista de Perfumes
 */
export const listarPerfumes = async () => {
  const perfumes = await prisma.perfume.findMany({
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

  return perfumes;
};

/**
 * Verifica se um perfume já está cadastrado pelo nome
 * @param {string} nome - Nome do perfume a ser verificado
 * @returns {Promise<boolean>} True se o perfume existe, false caso contrário
 */
const perfumeExiste = async (nome) => {
  const perfume = await prisma.perfume.findFirst({
    where: { nome: nome },
  });

  return !!perfume;
};

/**
 * Valida os dados de um perfume
 * @param {Object} perfumeDados - Dados do perfume
 * @throws {Error} Se validação falhar
 */
const validarPerfume = (perfumeDados) => {
  const { nome, marca, preco } = perfumeDados;

  if (!nome || !marca || preco === undefined || preco === null) {
    throw new Error('Nome, marca e preço são obrigatórios');
  }

  if (preco < 0) {
    throw new Error('Preço não pode ser negativo');
  }
};

/**
 * Cria um novo perfume
 * @param {Object} perfumeDados - Dados do novo perfume
 * @param {Object} file - Arquivo de imagem do perfume (opcional)
 * @returns {Promise<Object>} perfume criado
 * @throws {Error} Se validação falhar ou perfume já existir
 */
export const criarPerfume = async (perfumeDados, file = null) => {
  // 1. Validar dados de entrada
  validarPerfume(perfumeDados);

  // 2. Verificar se o nome do perfume já existe
  const verificaPerfumeExiste = await perfumeExiste(perfumeDados.nome);
  if (verificaPerfumeExiste) {
    throw new Error('Perfume já cadastrado no sistema');
  }

  // 3. Upload da foto se fornecida
  let fotoUrl = null; 
  if (file) {
    console.log("Arquivo recebido para upload:", file.originalname);
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
    console.log("Foto enviada com sucesso:", fotoUrl);
  }

  // 4. Criar perfume no banco
  const novoPerfume = await prisma.perfume.create({
    data: {
      nome: perfumeDados.nome,
      marca: perfumeDados.marca,
      quantidade_estoque: perfumeDados.quantidade_estoque || 0,
      foto: fotoUrl || perfumeDados.foto || null,
      preco: parseFloat(perfumeDados.preco),
      descricao: perfumeDados.descricao || null,
      frasco: perfumeDados.frasco ? parseFloat(perfumeDados.frasco) : null,
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

  return novoPerfume;
};

/**
 * Atualiza um perfume existente
 * @param {number} id - ID do perfume
 * @param {Object} perfumeDados - Dados para atualizar
 * @param {Object} file - Arquivo de imagem (opcional)
 * @returns {Promise<Object>} Perfume atualizado
 * @throws {Error} Se validação falhar ou perfume não existir
 */
export const atualizarPerfume = async (id, perfumeDados, file = null) => {
  // 1. Validar ID e converter para número
  const perfumeId = parseInt(id);
  if (isNaN(perfumeId)) {
    throw new Error('ID inválido');
  }

  // 2. Verificar se perfume existe
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 3. Se nome está sendo alterado, verificar unicidade
  if (perfumeDados.nome && perfumeDados.nome !== perfumeExistente.nome) {
    const nomeJaExiste = await perfumeExiste(perfumeDados.nome);
    if (nomeJaExiste) {
      throw new Error('Nome já está em uso por outro perfume');
    }
  }

  // 4. Upload da nova foto se fornecida
  let fotoUrl = null; 
  if (file) {
    console.log("Arquivo recebido para upload:", file.originalname);
    fotoUrl = await uploadImgUploadcare(file.buffer, file.originalname, file.mimetype);
    console.log("Nova foto enviada:", fotoUrl);
  }

  // 5. Preparar dados para atualização (apenas campos fornecidos)
  const dadosAtualizados = {};

  if (perfumeDados.nome) dadosAtualizados.nome = perfumeDados.nome;
  if (perfumeDados.marca) dadosAtualizados.marca = perfumeDados.marca;
  if (perfumeDados.preco !== undefined) dadosAtualizados.preco = parseFloat(perfumeDados.preco);
  if (perfumeDados.descricao !== undefined) dadosAtualizados.descricao = perfumeDados.descricao;
  if (perfumeDados.frasco !== undefined) dadosAtualizados.frasco = parseFloat(perfumeDados.frasco);

  // Prioriza a foto do upload, senão usa a do body
  if (file && fotoUrl) {
    dadosAtualizados.foto = fotoUrl;
  } else if (perfumeDados.foto !== undefined) {
    dadosAtualizados.foto = perfumeDados.foto;
  }

  // 6. Atualizar perfume no banco
  const perfumeAtualizado = await prisma.perfume.update({
    where: { id: perfumeId },
    data: dadosAtualizados,
    select: {
      id: true,
      nome: true,
      marca: true,
      preco: true,
      foto: true,
      descricao: true,
      frasco: true,
      quantidade_estoque: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("Perfume atualizado com sucesso:", perfumeAtualizado);

  return perfumeAtualizado;
};

/**
 * Atualiza o estoque de um perfume existente
 * @param {number} id - ID do perfume
 * @param {Object} perfumeDados - Dados para atualizar
 * @returns {Promise<Object>} Perfume atualizado
 * @throws {Error} Se validação falhar ou perfume não existir
 */
export const atualizarEstoquePerfume = async (id, perfumeDados) => {
  // 1. Validar ID e converter para número
  const perfumeId = parseInt(id);
  if (isNaN(perfumeId)) {
    throw new Error('ID inválido');
  }

  // 2. Validar quantidade
  if (perfumeDados.quantidade_estoque === undefined || perfumeDados.quantidade_estoque === null) {
    throw new Error('Quantidade de estoque é obrigatória');
  }

  const quantidade = parseInt(perfumeDados.quantidade_estoque);
  if (isNaN(quantidade) || quantidade < 0) {
    throw new Error('Quantidade não pode ser negativa');
  }

  // 3. Verificar se perfume existe
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
  });

  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 4. Atualizar o estoque do perfume no banco
  const perfumeEstoqueAtualizado = await prisma.perfume.update({
    where: { id: perfumeId },
    data: {
      quantidade_estoque: quantidade,
    },
    select: {
      id: true,
      nome: true,
      quantidade_estoque: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return perfumeEstoqueAtualizado;
};

/**
 * Remove um perfume do sistema
 * @param {number} id - ID do perfume
 * @returns {Promise<Object>} Dados do perfume removido
 * @throws {Error} Se perfume não existir
 */
export const excluirPerfume = async (id) => {
  // 1. Validar ID e converter para número
  const perfumeId = parseInt(id);
  if (isNaN(perfumeId)) {
    throw new Error('ID inválido');
  }

  // 2. Verificar se perfume existe
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: perfumeId },
    select: {
      id: true,
      nome: true,
      marca: true,
      quantidade_estoque: true,
      foto: true,
      descricao: true,
      frasco: true,
      preco: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 3. Remover perfume do banco
  await prisma.perfume.delete({
    where: { id: perfumeId },
  });

  // 4. Retornar dados do perfume removido (para confirmação)
  return perfumeExistente;
};

export default {
  listarPerfumes,
  criarPerfume,
  atualizarPerfume,
  atualizarEstoquePerfume,
  excluirPerfume,
};