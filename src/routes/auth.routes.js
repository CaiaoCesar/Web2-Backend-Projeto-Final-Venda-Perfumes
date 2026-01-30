import { Router } from "express";
import { registrarVendedor, loginVendedor } from "../controllers/auth.controller.js";
import multer from 'multer';
const upload = multer();

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - telefone
 *               - estado
 *               - cidade
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
 *                 example: "(38) 99999-9999"
 *               estado:
 *                 type: string
 *                 example: "MG"
 *               cidade:
 *                 type: string
 *                 example: "Salinas"
 *     responses:
 *       201:
 *         description: Novo vendedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */

// Rota para criar novo usuário vendedor
router.post("/register", upload.none(), registrarVendedor);

/**
 * @swagger
 * /api/v2/vendedores/login:
 *   post:
 *     summary: Fazer login como vendedor
 *     description: Autentica um vendedor no sistema
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
 *   responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Dados inválidos
 */
router.post("/login", loginVendedor);

export default router;