import { Router } from 'express';
import { validacao } from '../middlewares/validation.middleware.js';
import * as checkoutController from '../controllers/checkout.controller.js';
import { esquemaCheckoutWhatsApp } from '../schemas/checkout.schema.js';

const router = Router();

/**
 * @swagger
 * /api/v2/checkout/whatsapp:
 *   post:
 *     summary: Enviar pedido via WhatsApp
 *     tags:
 *       - Checkout
 *     description: >
 *       Gera um link do WhatsApp baseado no ID do carrinho
 *       armazenado no servidor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - telefone
 *               - carrinhoId
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               telefone:
 *                 type: string
 *                 example: "(11) 99999-9999"
 *               carrinhoId:
 *                 type: string
 *                 description: >
 *                   ID do carrinho retornado na criação
 *                   (carrinho_{timestamp}_{random})
 *                 example: carrinho_1700000000000_abc123
 *     responses:
 *       302:
 *         description: Redireciona para o WhatsApp com a mensagem preenchida
 *       400:
 *         description: Dados inválidos ou carrinho vazio
 *       404:
 *         description: Carrinho não encontrado
 */
router.post('/whatsapp', validacao(esquemaCheckoutWhatsApp), checkoutController.checkoutWhatsApp);

export default router;