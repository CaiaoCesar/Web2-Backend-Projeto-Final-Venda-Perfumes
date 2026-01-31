// src/routes/produto.routes.js
import { Router } from 'express';
import * as produtoController from '../controllers/produto.controller.js';
import upload from '../config/upload.js';
import { 
  validarCriacaoProduto, 
  validarEditarProduto, 
  validarEditarEstoque,
  validarId 
} from '../middlewares/validation.middleware.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v2/perfumes:
 *   post:
 *     summary: Criar um novo perfume
 *     description: Cria um novo perfume no sistema (apenas vendedores autenticados)
 *     tags: [Perfumes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - marca
 *               - preco
 *               - descricao
 *               - frasco
 *               - quantidade_estoque
 *               - foto
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Chanel No 5"
 *               marca:
 *                 type: string
 *                 example: "Chanel"
 *               descricao:
 *                 type: string
 *                 example: "Perfume floral com notas de jasmim"
 *               preco:
 *                 type: number
 *                 format: float
 *                 example: 299.90
 *               frasco:
 *                 type: number
 *                 format: float
 *                 example: 100.0
 *               quantidade_estoque:
 *                 type: integer
 *                 example: 50
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPEG, PNG, WEBP, GIF - máx 5MB)
 *     responses:
 *       201:
 *         description: Perfume criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */

// Rota para criar novo perfume
// 1º Autentica -> 2º Upload -> 3º Valida -> 4º Controller
router.post('/', authMiddleware, upload.single('foto'), validarCriacaoProduto, produtoController.criarPerfume);

/**
 * @swagger
 * /api/v2/perfumes:
 *   get:
 *     summary: Listar todos os perfumes
 *     description: Retorna uma lista de todos os perfumes disponíveis (pública)
 *     tags: [Perfumes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade por página
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *     responses:
 *       200:
 *         description: Lista de perfumes retornada com sucesso
 */

// Rota para listar produtos do vendedor
router.get("/", authMiddleware, produtoController.listarPerfumes);

/**
 * @swagger
 * /api/v2/perfumes/estoque/{id}:
 *   put:
 *     summary: Atualizar estoque de um perfume
 *     description: Atualiza apenas a quantidade em estoque de um perfume
 *     tags: [Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade_estoque
 *             properties:
 *               quantidade_estoque:
 *                 type: integer
 *                 example: 75
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *       400:
 *         description: Quantidade inválida
 *       404:
 *         description: Perfume não encontrado
 */

// Rota para editar estoque perfume, é necessário validar o ID
router.put('/estoque/:id', authMiddleware, validarId, validarEditarEstoque, produtoController.editarEstoquePerfume);

/**
 * @swagger
 * /api/v2/perfumes/{id}:
 *   put:
 *     summary: Atualizar um perfume
 *     description: Atualiza os dados de um perfume existente (apenas vendedores autenticados)
 *     tags: [Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfume
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: ""
 *               marca:
 *                 type: string
 *                 example: ""
 *               descricao:
 *                 type: string
 *                 example: ""
 *               preco:
 *                 type: number
 *                 example: ""
 *               frasco:
 *                 type: number
 *                 example: ""
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Nova foto do produto (JPEG, PNG, WEBP, GIF - máx 5MB)
 *     responses:
 *       200:
 *         description: Perfume atualizado com sucesso
 *       404:
 *         description: Perfume não encontrado
 *       401:
 *         description: Não autenticado
 */

// Rota para editar perfume, é necessário validar ID
router.put('/:id', authMiddleware, validarId, upload.single('foto'), validarEditarProduto, produtoController.editarPerfume);
/**
 * @swagger
 * /api/v2/perfumes/{id}:
 *   delete:
 *     summary: Deletar um perfume
 *     description: Remove um perfume do sistema (apenas vendedores autenticados)
 *     tags: [Perfumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do perfume
 *     responses:
 *       200:
 *         description: Perfume deletado com sucesso
 *       404:
 *         description: Perfume não encontrado
 *       401:
 *         description: Não autenticado
 */

// Rota para deletar um produto, é necessário validar o ID
router.delete('/:id', authMiddleware, validarId, produtoController.deletarPerfume);

export default router;