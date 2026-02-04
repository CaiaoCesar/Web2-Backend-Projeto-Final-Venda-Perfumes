import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as pedidoController from '../controllers/pedido.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pedidos
 *     description: Gerenciamento de pedidos
 */

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Cria um pedido (público)
 *     description: Rota utilizada pelo checkout para gerar um novo pedido. Não requer autenticação.
 *     tags:
 *       - Pedidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itens
 *               - cliente
 *             properties:
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - produtoId
 *                     - quantidade
 *                   properties:
 *                     produtoId:
 *                       type: string
 *                     quantidade:
 *                       type: integer
 *               cliente:
 *                 type: object
 *                 required:
 *                   - nome
 *                   - email
 *                 properties:
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso.
 *       400:
 *         description: Erro na validação dos dados.
 */
router.post('/', pedidoController.criarPedido);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos.
 *       401:
 *         description: Não autorizado.
 */
router.get('/', authMiddleware, pedidoController.listarPedidos);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Busca um pedido específico
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Detalhes do pedido.
 *       404:
 *         description: Pedido não encontrado.
 */
router.get('/:id', authMiddleware, pedidoController.buscarPedido);

/**
 * @swagger
 * /pedidos/{id}/status:
 *   patch:
 *     summary: Atualiza o status do pedido
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDENTE
 *                   - PAGO
 *                   - ENVIADO
 *                   - ENTREGUE
 *                   - CANCELADO
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 */
router.patch('/:id/status', authMiddleware, pedidoController.atualizarStatus);

/**
 * @swagger
 * /pedidos/{id}:
 *   patch:
 *     summary: Atualiza dados gerais do pedido
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campos do pedido para atualizar
 *     responses:
 *       200:
 *         description: Pedido atualizado.
 */
router.patch('/:id', authMiddleware, pedidoController.atualizarPedido);

export default router;
