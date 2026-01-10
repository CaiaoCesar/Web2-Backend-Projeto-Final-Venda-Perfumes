import prisma from '../config/database.js';

/**
 * Perfume Service
 * Responsável pela lógica de negócio relacionada aos perfumes
 * Contém as regras de validação, transformação de dados e acesso ao banco
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
        }
    });

    return perfumes; 
};

/**
 * Verifica se um perfume já está cadastrado
 * @param {string} nome - Nome do perfume a ser verificado
 * @returns {Promise<boolean>} True se o perfume existe, false caso contrário
 */
const perfumeExiste = async (nome) => {
  const perfume = await prisma.perfume.findUnique({
    where: { email: nome },
  });

  return !!perfume; // Converte para boolean
};

/**
 * Valida os dados de um perfume
 * @param {Object} perfumeDados - Dados do perfume
 * @throws {Error} Se validação falhar
 */
const validarPerfume = (perfumeDados) => {
  const { nome, marca, preco } = perfumeDados;
  
  if (!nome || !marca || !preco) {
    throw new Error('Nome, email e senha são obrigatórios');
  }

};


/**
 * Cria um novo perfume
 * @param {Object} perfumeDados - Dados do novo perfume
 * @returns {Promise<Object>} perfume criado
 * @throws {Error} Se validação falhar ou perfume já existir
 */

export const criarPerfume = async (perfumeDados) => {
  // 1. Validar dados de entrada
  validateUserData(perfumeDados);

  // 2. Verificar se o nome do perfume já existe
  const verificaPerfumeExiste = await perfumeExiste(perfumeDados.nome);
  if (perfumeExiste) {
    throw new Error('Perfume já cadastrado no sistema');
  }

  // 3. Criar perfume no banco
  const novoPerfume = await prisma.perfume.create({
   data: {
      nome: perfumeDados.nome,
      marca: perfumeDados.marca,
      quantidade_estoque: perfumeDados.senha,
      foto:  perfumeDados.foto || null,
      preco:  perfumeDados.preco,
      descricao:  perfumeDados.descricao,
      frasco:  perfumeDados.frasco
    },
    select: {
      id: true,
      nome: true,
      marca: true,
      quantidade_estoque: true,
      foto: true, 
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
 * @returns {Promise<Object>} Perfume atualizado
 * @throws {Error} Se validação falhar ou perfume não existir
 */
export const atualizarPerfume = async (id, perfumeDados) => {
  // 1. Validar ID
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // 2. Verificar se usuário existe
  const perfumeExistente = await prisma.perfume.findUnique({
    where: { id: parseInt(id) },
  });

  if (!perfumeExistente) {
    throw new Error(`Perfume com ID ${id} não encontrado`);
  }

  // 3. Se nome está sendo alterado, verificar unicidade
  if (perfumeDados.nome && (perfumeDados.nome !== perfumeExistente.nome)) {
    const nomeJaExiste = await perfumeExiste(perfumeDados.nome);
    if (nomeJaExiste) {
      throw new Error('Nome já está em uso por outro perfume');
    }
  }

    // 4. Preparar dados para atualização (apenas campos fornecidos)
    const dadosAtualizados = {};

    if (perfumeDados.nome) {
      dadosAtualizados.nome = perfumeDados.nome;
    }

    if (perfumeDados.marca) {
      dadosAtualizados.marca = perfumeDados.marca;
    }

    if (perfumeDados.preco) {
      dadosAtualizados.preco = perfumeDados.preco;
    }

    if (perfumeDados.quantidade_estoque) {
      dadosAtualizados.quantidade_estoque = perfumeDados.quantidade_estoque;
    }

    if (perfumeDados.foto) {
      dadosAtualizados.foto = perfumeDados.foto;
    }

    if (perfumeDados.descricao) {
      dadosAtualizados.descricao = perfumeDados.descricao;
    }

    if (perfumeDados.frasco) {
      dadosAtualizados.frasco = perfumeDados.frasco;
    }

    // 5. Atualizar perfume no banco
    const perfumeAtualizado = await prisma.perfume.update({
      where: { id: parseInt(id) },
      data: dadosAtualizados,
      select: {
        id: true,
        nome: true,
        marca: true,
        quantidade_estoque: true,
        foto: true, 
        descricao: true, 
        frasco: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return perfumeAtualizado;
};

/**
 * Remove um perfume do sistema
 * @param {number} id - ID do perfume
 * @returns {Promise<Object>} Dados do perfume removido
 * @throws {Error} Se usuário não existir
 */

export const excluirPerfume = async (id) => {
    // 1. Validar ID
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('ID inválido. Deve ser um número positivo');
    }

    // 2. Verificar se perfume existe
    const perfumeExistente = await prisma.perfume.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        marca: true,
        quantidade_estoque: true,
        foto: true, 
        descricao: true, 
        frasco: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!perfumeExistente) {
      throw new Error(`Perfume com ID ${id} não encontrado`);
    }

    // 3. Remover perfume do banco
    await prisma.perfume.delete({
      where: { id: parseInt(id) },
    });

    // 4. Retornar dados do usuário removido (para confirmação)
    return usuarioExistente;  
};

// Exportações nomeadas para facilitar testes e imports
export default {
  listarPerfumes,
  criarPerfume,
  atualizarPerfume,
  excluirPerfume,
};
