import { Router } from 'express';
import * as buscaController from '../controllers/busca.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v2/buscas:
 *   get:
 *     summary: Busca pública de perfumes
 *     tags: [Busca]
 *     description: Permite buscar perfumes com filtros, ordenação e paginação.
 *
 *     parameters:
 *       - in: query
 *         name: cidade
 *         required: true
 *         schema:
 *           type: string
 *         description: Cidade do vendedor (Obrigatório)
 *
 *       - in: query
 *         name: estado
 *         required: true
 *         schema:
 *           type: string
 *         description: Estado/UF do vendedor (Obrigatório, ex SP)
 * 
 *       - in: query
 *         name: termo
 *         schema:
 *           type: string
 *         description: Termo para buscar apenas no NOME do perfume
 *
 *       - in: query
 *         name: precoMin
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *
 *       - in: query
 *         name: precoMax
 *         schema:
 *           type: number
 *         description: Preço máximo
 *
 *       - in: query
 *         name: ordenar
 *         schema:
 *           type: string
 *           enum: [menor_preco, maior_preco, mais_vendidos]
 *           default: mais_vendidos
 *         description: Critério de ordenação
 *
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *
 *     responses:
 *       200:
 *         description: Lista de perfumes encontrados com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: sucesso
 *                 dados:
 *                   type: object
 *                   properties:
 *                     produtos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Perfume'
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         paginaAtual:
 *                           type: integer
 *                         totalPaginas:
 *                           type: integer
 *                         itensPorPagina:
 *                           type: integer
 *
 *       400:
 *         description: Parâmetros de busca inválidos
 */
router.get('/', buscaController.buscarPerfumes);

export default router;
