import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validacao } from '../middlewares/validation.middleware.js';
import * as pedidosController from '../controllers/pedidos.controller.js';
import { esquemaCriarPedido, esquemaAtualizarStatus } from '../schemas/pedido.schema.js';

const router = Router();

/**
 * @swagger
 * /api/v2/pedidos:
 *   post:
 *     summary: Criar um novo pedido
 *     tags:
 *       - Pedidos
 *     description: >
 *       Cria um pedido a partir do carrinho do cliente.
 *       Chamado pelo frontend após o checkout via WhatsApp.
 *       Valida estoque, calcula o total e gera a mensagem WhatsApp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendedorId
 *               - nome
 *               - telefone
 *               - carrinhoId
 *             properties:
 *               vendedorId:
 *                 type: integer
 *                 description: ID do vendedor dono dos produtos
 *                 example: 1
 *               nome:
 *                 type: string
 *                 description: Nome do cliente
 *                 example: João Silva
 *               telefone:
 *                 type: string
 *                 description: Telefone do cliente
 *                 example: "(11) 99999-9999"
 *               carrinhoId:
 *                 type: string
 *                 description: ID do carrinho no servidor
 *                 example: carrinho_1700000000000_abc123
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados inválidos, estoque insuficiente ou carrinho vazio
 */
router.post('/', validacao(esquemaCriarPedido), pedidosController.criarPedido);

/**
 * @swagger
 * /api/v2/pedidos/{id}/whatsapp:
 *   patch:
 *     summary: Marcar mensagem WhatsApp como enviada
 *     tags:
 *       - Pedidos
 *     description: >
 *       Atualiza o flag enviado_whatsapp do pedido para true.
 *       Chamado pelo frontend após redirecionar o cliente para o WhatsApp.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido (cuid)
 *         example: cltj8a2x00001abc123def456
 *     responses:
 *       200:
 *         description: Flag atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.patch('/:id/whatsapp', pedidosController.marcarWhatsappEnviado);

/**
 * @swagger
 * /api/v2/pedidos:
 *   get:
 *     summary: Listar pedidos do vendedor
 *     tags:
 *       - Pedidos
 *     description: >
 *       Retorna todos os pedidos do vendedor autenticado.
 *       Suporta filtro opcional por status via query string.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADO]
 *         description: Filtrar pedidos por status
 *     responses:
 *       200:
 *         description: Lista de pedidos do vendedor
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/', authMiddleware, pedidosController.listarPedidos);

/**
 * @swagger
 * /api/v2/pedidos/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags:
 *       - Pedidos
 *     description: >
 *       Retorna os detalhes completos de um pedido.
 *       Só retorna se o pedido pertencer ao vendedor autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido (cuid)
 *         example: cltj8a2x00001abc123def456
 *     responses:
 *       200:
 *         description: Detalhes do pedido
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:id', authMiddleware, pedidosController.buscarPedido);

/**
 * @swagger
 * /api/v2/pedidos/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags:
 *       - Pedidos
 *     description: >
 *       Atualiza o status de um pedido do vendedor autenticado.
 *       Transição permitida: PENDENTE → CONFIRMADO.
 *       Não é possível voltar de CONFIRMADO para PENDENTE.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido (cuid)
 *         example: cltj8a2x00001abc123def456
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
 *                 enum: [PENDENTE, CONFIRMADO]
 *                 example: CONFIRMADO
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Transição de status inválida
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.patch('/:id/status', authMiddleware, validacao(esquemaAtualizarStatus), pedidosController.atualizarStatus);

export default router;