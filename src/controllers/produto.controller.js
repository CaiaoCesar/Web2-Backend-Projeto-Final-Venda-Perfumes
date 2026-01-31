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
    // Captura o ID do vendedor autenticado
    const vendedorId = req.user.id;

    // req.file é populado pelo multer quando há upload e passa o vendedor que está fazendo a solicitação
    const novoPerfume = await perfumeService.criarPerfume(req.body, req.file, Number(vendedorId));

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
// src/controllers/produto.controller.js

export const listarPerfumes = async (req, res, next) => {
  try {
    const vendedorId = req.user.id;
    
    // Os dados já vêm validados e transformados pelo middleware
    const { nome, page, limit } = req.query;
    
    const filtros = {
      nome,
      page,
      limit
    };

    const resultado = await perfumeService.listarPerfumes(Number(vendedorId), filtros);

    res.status(200).json({
      success: true,
      message: 'Seus perfumes foram listados com sucesso!',
      data: resultado.perfumes,
      pagination: {
        total: resultado.total,
        page: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(resultado.total / filtros.limit)
      }
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
    // Captura o ID do vendedor autenticado vindo do JWT
    const vendedorId = req.user.id; 

    // Passamos o vendedorId como o último argumento para conferir a propriedade
    const perfumeAtualizado = await perfumeService.atualizarPerfume(
      id, 
      req.body, 
      req.file, 
      Number(vendedorId)
    );

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
    
    // Captura o ID do vendedor autenticado
    const vendedorId = req.user.id; 

    // Passa o ID para o service validar a propriedade
    const estoqueAtualizado = await perfumeService.atualizarEstoquePerfume(
      id, 
      req.body, 
      Number(vendedorId)
    );

    res.status(200).json({
      message: 'Estoque atualizado com sucesso!',
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
    // Captura o ID do vendedor autenticado
    const vendedorId = req.user.id; 

    // Passa o ID do perfume e o ID do dono para validação
    const perfumeDeletado = await perfumeService.excluirPerfume(id, Number(vendedorId));

    res.status(200).json({
      message: 'Perfume e imagem removidos com sucesso!',
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