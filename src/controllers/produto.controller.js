// src/controllers/produto.controller.js
import * as perfumeService from '../services/produto.service.js';

/**
 * Perfume Controller
 * Responsável por gerenciar requisições HTTP relacionadas aos perfumes
 * Delega a lógica de negócio para o perfumeService
 */

/**
 * POST /api/produtos
 * Cria um novo perfume
 */
export const criarPerfume = async (req, res, next) => {
  try {
    // req.file é populado pelo multer quando há upload
    const novoPerfume = await perfumeService.criarPerfume(req.body, req.file);

    res.status(201).json({
      success: true,
      message: 'Perfume criado com sucesso!',
      data: novoPerfume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/produtos
 * Listar todos os perfumes
 */
export const listarPerfumes = async (req, res, next) => {
  try {
    const perfumes = await perfumeService.listarPerfumes();
    res.status(200).json({
      message: 'Perfumes listados com sucesso!',
      success: true,
      data: perfumes,
      total: perfumes.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/produtos/:id
 * Atualiza um perfume existente
 */
export const editarPerfume = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Passa o arquivo se houver upload
    const perfumeAtualizado = await perfumeService.atualizarPerfume(id, req.body, req.file);

    res.status(200).json({
      message: 'Perfume atualizado com sucesso!',
      success: true,
      data: perfumeAtualizado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/produtos/estoque/:id
 * Atualiza o estoque de um perfume existente
 */
export const editarEstoquePerfume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estoqueAtualizado = await perfumeService.atualizarEstoquePerfume(id, req.body);

    res.status(200).json({
      message: 'Estoque do perfume atualizado com sucesso!',
      success: true,
      data: estoqueAtualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/produtos/:id
 * Deleta um perfume existente
 */
export const deletarPerfume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const perfumeDeletado = await perfumeService.excluirPerfume(id);

    res.status(200).json({
      message: 'Perfume deletado com sucesso!',
      success: true,
      data: perfumeDeletado
    });
  } catch (error) {
    next(error);
  }
};

export default {
  criarPerfume,
  listarPerfumes,
  editarPerfume,
  editarEstoquePerfume,
  deletarPerfume,
};