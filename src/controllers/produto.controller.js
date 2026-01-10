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

export const editarPerfume = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, marca, preco } = req.body;

    await prisma.perfume.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        marca,
        foto,
        preco,
        descricao,
        frasco,
      },
    });

    res.status(200).json({ message: 'Perfume atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const editarEstoquePerfume = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade_estoque } = req.body;

    const perfumeAtual = await prisma.perfume.findUnique({
      where: { id: parseInt(id) },
    });

    if (!perfumeAtual) {
      return res.status(404).json({ message: 'Perfume não encontrado!' });
    }

    const novoEstoque = (perfumeAtual.quantidade_estoque || 0) + quantidade_estoque;

    if (novoEstoque < 0) {
      return res
        .status(400)
        .json({ message: 'Quantidade insuficiente para adicionar ao estoque!' });
    }

    await prisma.perfume.update({
      where: { id: parseInt(id) },
      data: {
        quantidade_estoque: novoEstoque,
      },
    });

    res.status(200).json({ message: 'Estoque do perfume atualizado com sucesso!' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao atualizar o estoque do perfume', error: error.message });
  }
};

export const deletarPerfume = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.perfume.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Perfume deletado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error ao deletar perfume!', error: error.message });
  }
};
