/**
 * @swagger
 * components:
 *   schemas:
 *     Perfume:
 *       type: object
 *       required:
 *         - nome
 *         - marca
 *         - preco
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-gerado do perfume
 *           example: "clxyz123abc"
 *         nome:
 *           type: string
 *           description: Nome do perfume
 *           example: "Sauvage"
 *         marca:
 *           type: string
 *           description: Marca do perfume
 *           example: "Dior"
 *         descricao:
 *           type: string
 *           description: Descrição detalhada
 *           example: "Perfume masculino amadeirado"
 *         preco:
 *           type: number
 *           format: float
 *           description: Preço em reais
 *           example: 399.90
 *         frasco:
 *           type: number
 *           format: float
 *           description: Quantidade em ml
 *           example: 100.0
 *         quantidade_estoque:
 *           type: integer
 *           description: Quantidade disponível
 *           example: 50
 *         foto:
 *           type: string
 *           description: URL da imagem
 *           example: "https://exemplo.com/foto.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 * 
 *     PerfumeInput:
 *       type: object
 *       required:
 *         - nome
 *         - marca
 *         - preco
 *       properties:
 *         nome:
 *           type: string
 *           example: "Nova Fragrância"
 *         marca:
 *           type: string
 *           example: "Chanel"
 *         descricao:
 *           type: string
 *           example: "Descrição do perfume"
 *         preco:
 *           type: number
 *           format: float
 *           example: 299.90
 *         frasco:
 *           type: number
 *           format: float
 *           example: 100.0
 *         quantidade_estoque:
 *           type: integer
 *           example: 50
 * 
 *     Erro:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *           example: "Perfume não encontrado"
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           description: Detalhes do erro (opcional)
 */