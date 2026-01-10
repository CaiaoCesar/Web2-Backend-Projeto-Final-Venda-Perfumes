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