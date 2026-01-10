import prisma from "../config/database.js";

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

// Exportações nomeadas para facilitar testes e imports
export default {
  listarPerfumes,
  criarPerfume
};
