import e, { Router } from 'express';
import * as carrinhoController from '../controllers/carrinho.controller.js';
import { validacao } from '../middlewares/validation.middleware.js';
import * as carrinhoSchema  from '../schemas/carrinho.schema.js';

export const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Carrinho
 *     description: Gerenciamento de carrinho de compras (em memória)
 */

/**
 * @swagger
 * /api/v2/carrinho:
 *   post:
 *     summary: Cria um novo carrinho
 *     tags: [Carrinho]
 *     description: Inicializa um carrinho de compras vazio e retorna seu ID.
 *     responses:
 *       201:
 *         description: Carrinho criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID único do carrinho
 *                     vendorId:
 *                       type: integer
 *                       nullable: true
 *                       description: ID do vendedor
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       example: 0
 */
router.post('/', carrinhoController.criarCarrinho);

/**
 * @swagger
 * /api/v2/carrinho/{carrinhoId}:
 *   get:
 *     summary: Visualiza um carrinho
 *     tags: [Carrinho]
 *     description: Retorna os detalhes e itens de um carrinho específico.
 *     parameters:
 *       - in: path
 *         name: carrinhoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do carrinho
 *     responses:
 *       200:
 *         description: Detalhes do carrinho
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     vendorId:
 *                       type: integer
 *                       nullable: true
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           perfumeId:
 *                             type: integer
 *                           nome:
 *                             type: string
 *                           preco:
 *                             type: number
 *                           quantidade:
 *                             type: integer
 *                           foto:
 *                             type: string
 *                     total:
 *                       type: number
 *       404:
 *         description: Carrinho não encontrado
 */
router.get('/:carrinhoId', carrinhoController.verCarrinho);

/**
 * @swagger
 * /api/v2/carrinho/{carrinhoId}/items:
 *   post:
 *     summary: Adiciona item ao carrinho
 *     tags: [Carrinho]
 *     description: |
 *       Adiciona um perfume ao carrinho.
 *       O carrinho aceita apenas produtos de um único vendedor.
 *     parameters:
 *       - in: path
 *         name: carrinhoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perfumeId
 *             properties:
 *               perfumeId:
 *                 type: integer
 *               quantidade:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item adicionado com sucesso
 *       400:
 *         description: Erro de validação (estoque insuficiente ou vendedor diferente)
 *       404:
 *         description: Carrinho ou perfume não encontrado
 */
router.post('/:carrinhoId/items', carrinhoController.adicionarItem);

/**
 * @swagger
 * /api/v2/carrinho/{carrinhoId}/items/{perfumeId}:
 *   put:
 *     summary: Atualiza a quantidade de um item
 *     tags: [Carrinho]
 *     parameters:
 *       - in: path
 *         name: carrinhoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 description: Se menor que 1, o item será removido
 *     responses:
 *       200:
 *         description: Quantidade atualizada com sucesso
 *       400:
 *         description: Quantidade inválida ou estoque insuficiente
 *       404:
 *         description: Item não encontrado
 */
router.put('/:carrinhoId/items/:perfumeId', carrinhoController.atualizarQuantidade);

/**
 * @swagger
 * /api/v2/carrinho/{carrinhoId}/items/{perfumeId}:
 *   delete:
 *     summary: Remove um item do carrinho
 *     tags: [Carrinho]
 *     parameters:
 *       - in: path
 *         name: carrinhoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       404:
 *         description: Carrinho ou item não encontrado
 */
router.delete('/:carrinhoId/items/:perfumeId', carrinhoController.removerItem);

/**
 * @swagger
 * /api/v2/carrinho/{carrinhoId}:
 *   delete:
 *     summary: Limpa o carrinho
 *     tags: [Carrinho]
 *     description: Remove todos os itens do carrinho e reseta o vendedor.
 *     parameters:
 *       - in: path
 *         name: carrinhoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrinho limpo com sucesso
 *       404:
 *         description: Carrinho não encontrado
 */
router.delete('/:carrinhoId', carrinhoController.limparCarrinho);

export default router;
