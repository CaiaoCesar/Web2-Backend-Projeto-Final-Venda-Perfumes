import { Router } from 'express';
import { registrarVendedor, loginVendedor } from '../controllers/auth.controller.js';
import { validacao } from '../middlewares/validation.middleware.js';
import { vendedorSchema } from '../schemas/vendedor.schema.js';

const router = Router();

/**
 * @swagger
 * /api/v2/vendedores/register:
 *   post:
 *     summary: Criar uma nova conta de vendedor
 *     description: Registra um novo vendedor no sistema
 *     tags: [Vendedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - telefone
 *               - estado
 *               - cidade
 *               - nome_loja
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Nome do Vendedor"
 *               email:
 *                 type: string
 *                 example: "vendedor@exemplo.com"
 *               senha:
 *                 type: string
 *                 example: "senhaSegura"
 *               telefone:
 *                 type: string
 *                 example: "38999999999"
 *               estado:
 *                 type: string
 *                 example: "MG"
 *               cidade:
 *                 type: string
 *                 example: "Salinas"
 *               nome_loja: 
 *                type: string
 *                example: "Loja do Vendedor"
 *     responses:
 *       201:
 *         description: Novo vendedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */

// Rota para validar dados e criar novo usuário vendedor
router.post('/register', validacao(vendedorSchema), registrarVendedor);

/**
 * @swagger
 * /api/v2/vendedores/login:
 *   post:
 *     summary: Faz login na conta de vendedor
 *     description: Realiza login na conta de vendedor
 *     tags: [Vendedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: "vendedor@exemplo.com"
 *               senha:
 *                 type: string
 *                 example: "senhaSegura"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso com sucesso
 *       401:
 *         description: Não autenticado
 */

// Rota para fazer login do vendedor
router.post('/login', loginVendedor);

export default router;
