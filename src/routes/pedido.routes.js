import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as pedidoController from '../controllers/pedido.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pedidos
 *     description: Gerenciamento de pedidos e checkout via WhatsApp
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     CriarPedidoRequest:
 *       type: object
 *       required:
 *         - nome
 *         - telefone
 *         - carrinhoId
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do cliente
 *           example: "João da Silva"
 *         telefone:
 *           type: string
 *           description: Telefone com DDD (apenas números ou formatado)
 *           example: "11999998888"
 *         carrinhoId:
 *           type: string
 *           description: UUID do carrinho previamente criado
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *
 *     PedidoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         quantidade:
 *           type: integer
 *           example: 2
 *         preco_unitario:
 *           type: number
 *           format: float
 *           example: 49.9
 *         perfume:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 42
 *             nome:
 *               type: string
 *               example: "Perfume Exemplo"
 *
 *     PedidoResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         valor_total:
 *           type: number
 *           format: float
 *           example: 99.8
 *         nome_cliente:
 *           type: string
 *           example: "João da Silva"
 *         telefone_cliente:
 *           type: string
 *           example: "11999998888"
 *         status:
 *           type: string
 *           enum:
 *             - PENDENTE
 *             - CONFIRMADO
 *             - CONCLUIDO
 *             - CANCELADO
 *           example: "PENDENTE"
 *         mensagem_whatsapp:
 *           type: string
 *           description: Mensagem formatada gerada para envio
 *           example: "*Pedido #101*..."
 *         whatsapp_link:
 *           type: string
 *           description: Link direto para enviar o pedido ao vendedor
 *           example: "https://api.whatsapp.com/send?phone=55119...&text=..."
 *         vendedorId:
 *           type: integer
 *           example: 5
 *         itens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Dados completos do pedido
 *
 *     PedidoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/PedidoResponse'
 *
 *     AtualizarStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - PENDENTE
 *             - CONFIRMADO
 *             - CONCLUIDO
 *             - CANCELADO
 *           example: CONFIRMADO
 *
 *     AtualizarPedidoRequest:
 *       type: object
 *       properties:
 *         nome_cliente:
 *           type: string
 *           description: Atualizar nome do cliente
 *           example: "João da Silva Junior"
 *         telefone_cliente:
 *           type: string
 *           description: Atualizar telefone do cliente
 *           example: "11988887777"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "error"
 *         message:
 *           type: string
 *           example: "Carrinho inválido ou vazio"
 */

/**
 * @swagger
 * /api/v2/pedidos:
 *   post:
 *     summary: Finaliza um pedido a partir de um carrinho (Checkout)
 *     description: Cria um pedido baseando-se no ID de um carrinho temporário existente. O carrinho é limpo após a criação.
 *     tags:
 *       - Pedidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarPedidoRequest'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso e link do WhatsApp gerado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       400:
 *         description: Dados incompletos, estoque insuficiente ou carrinho vazio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Produto não encontrado durante validação de estoque.
 */
router.post('/', pedidoController.criarPedido);

/**
 * @swagger
 * /api/v2/pedidos:
 *   get:
 *     summary: Lista todos os pedidos do vendedor autenticado
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos ordenada por data (mais recente primeiro).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoListResponse'
 *       401:
 *         description: Não autorizado (Token ausente ou inválido).
 */
router.get('/', authMiddleware, pedidoController.listarPedidos);

/**
 * @swagger
 * /api/v2/pedidos/{id}:
 *   get:
 *     summary: Busca detalhes de um pedido específico
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
 *         description: Detalhes do pedido, incluindo itens e dados do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: O pedido pertence a outro vendedor.
 *       404:
 *         description: Pedido não encontrado.
 */
router.get('/:id', authMiddleware, pedidoController.buscarPedido);

/**
 * @swagger
 * /api/v2/pedidos/{id}/status:
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
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarStatusRequest'
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       400:
 *         description: Status inválido ou não fornecido.
 *       403:
 *         description: Acesso negado ao pedido.
 *       404:
 *         description: Pedido não encontrado.
 */
router.patch('/:id/status', authMiddleware, pedidoController.atualizarStatus);

/**
 * @swagger
 * /api/v2/pedidos/{id}:
 *   patch:
 *     summary: Atualiza dados do cliente no pedido
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPedidoRequest'
 *     responses:
 *       200:
 *         description: Dados do pedido atualizados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       403:
 *         description: Acesso negado.
 *       404:
 *         description: Pedido não encontrado.
 */
router.patch('/:id', authMiddleware, pedidoController.atualizarPedido);

export default router;
