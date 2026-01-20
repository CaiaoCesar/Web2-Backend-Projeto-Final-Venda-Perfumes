// src/routes/produto.routes.js
import { Router } from 'express';
import * as perfumeController from '../controllers/produto.controller.js';
import upload from '../config/upload.js';
import { 
  validarCriacaoProduto, 
  validarEditarProduto, 
  validarEditarEstoque 
} from '../middlewares/validation.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Criar um novo perfume
 *     description: Cria um novo perfume no sistema (apenas vendedores autenticados)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
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
router.post('/', upload.single('foto'), validarCriacaoProduto, perfumeController.criarPerfume);

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Listar todos os perfumes
 *     description: Retorna uma lista de todos os perfumes disponíveis (pública)
 *     tags: [Produtos]
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
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *       - in: query
 *         name: minPreco
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *       - in: query
 *         name: maxPreco
 *         schema:
 *           type: number
 *         description: Preço máximo
 *     responses:
 *       200:
 *         description: Lista de perfumes retornada com sucesso
 */
router.get('/', perfumeController.listarPerfumes);

/**
 * @swagger
 * /api/produtos/estoque/{id}:
 *   put:
 *     summary: Atualizar estoque de um perfume
 *     description: Atualiza apenas a quantidade em estoque de um perfume
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
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
router.put('/estoque/:id', validarEditarEstoque, perfumeController.editarEstoquePerfume);

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualizar um perfume
 *     description: Atualiza os dados de um perfume existente (apenas vendedores autenticados)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Perfume Atualizado"
 *               marca:
 *                 type: string
 *                 example: "Dior"
 *               descricao:
 *                 type: string
 *                 example: "Descrição atualizada"
 *               preco:
 *                 type: number
 *                 example: 349.90
 *               frasco:
 *                 type: number
 *                 example: 150.0
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
router.put('/:id', upload.single('foto'), validarEditarProduto, perfumeController.editarPerfume);

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Deletar um perfume
 *     description: Remove um perfume do sistema (apenas vendedores autenticados)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
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
router.delete('/:id', perfumeController.deletarPerfume);

export default router;