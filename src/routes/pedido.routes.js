import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as pedidoController from '../controllers/pedido.controller.js';

const router = Router();

// Cria um pedido (público) — usado pelo checkout
router.post('/', pedidoController.criarPedido);

// Rotas protegidas para vendedores
router.get('/', authMiddleware, pedidoController.listarPedidos);
router.get('/:id', authMiddleware, pedidoController.buscarPedido);
router.patch('/:id/status', authMiddleware, pedidoController.atualizarStatus);
router.patch('/:id', authMiddleware, pedidoController.atualizarPedido);

export default router;