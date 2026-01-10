import { success } from 'zod/v4';
import * as perfumeService from '../services/produto.service.js';

/**
 * Perfume Controller
 * Responsável por gerenciar requisições HTTP relacionadas aos perfumes
 * Delega a lógica de negócio para o perfumeService
 */

/**
 * POST /api/produtos
 * cria um novo perfume
 */
export const criarPerfume = async (req, res) => {
  try {
    const { nome, marca, preco } = req.body;
    if (!nome || !marca || !preco) {
      return res.status(400).json({ message: 'Todos os campos devem ser preenchidos' });
    }

    const novoPerfume = await perfumeService.criarPerfume(req.body);

    res.status(201).json({
      success: true,
      message: 'Perfume criado com sucesso!',
      data: novoPerfume,
    });
  } catch (error) {
    console.error('Ocorreu um erro ao criar perfume:', error);
    return res.status(500).json({ success: false, message: 'Ocorreu um erro ao criar perfume!', error: error.message });
  }
};

/** 
 * GET /api/produtos
 * listar todos os perfumes
*/
export const listarPerfumes = async (req, res) => {
  try {
    const perfumes = await perfumeService.listarPerfumes();
    res.status(200).json({ message: 'Perfumes listados com sucesso!', success: true, data: perfumes, total: perfumes.length });
  } catch (error) {
    console.error('Ocorreu um erro ao listar perfumes:', error);
    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao listar perfumes!', success: false, error: error.message });
  }
};

/**
 * PUT /api/produtos/:id
 * Atualiza um perfume existente
 */
export const editarPerfume = async (req, res) => {
  try {
    const { id } = req.params;
    const perfumeAtualizado = await perfumeService.atualizarPerfume(id, req.body);

    res.status(200).json({ message: 'Perfume atualizado com sucesso!', success: true, data: perfumeAtualizado });
  } catch (error) {
    console.error('Ocorreu um erro ao atualizar perfume:', error);
    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao atualizar perfume!', success: false, error: error.message });
  }
};

/**
 * PUT /api/produtos/:id
 * Atualiza o estoque de um perfume existente
 */
export const editarEstoquePerfume = async (req, res) => {
  try {
    const { id } = req.params;
    const estoqueAtualizado = await perfumeService.atualizarEstoquePerfume(id, req.body);

    res.status(200).json({ message: 'Estoque do perfume atualizado com sucesso!', success: true, data: estoqueAtualizado });
  } catch (error) {
    console.log({'Ocorreu um erro ao atualizar o estoque do perfume': error});  
    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao atualizar o estoque do perfume', success: false, error: error.message });
  }
};

/**
 * DELETE /api/produtos/:id
 * Deleta um perfume existente
 */
export const deletarPerfume = async (req, res) => {
  try {
    const { id } = req.params;
    const perfumeDeletado = await perfumeService.excluirPerfume(id);

    res.status(200).json({ message: 'Perfume deletado com sucesso!', success: true, data: perfumeDeletado });
  } catch (error) {
    console.error('Ocorreu um erro ao deletar perfume:', error);
    return res.status(500).json({ message: 'Error ao deletar perfume!', success: false, error: error.message });
  }
};
