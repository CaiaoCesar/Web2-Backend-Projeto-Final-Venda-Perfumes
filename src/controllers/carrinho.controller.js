import * as carrinhoService from '../services/carrinho.service.js';

export const criarCarrinho = (req, res, next) => {
  try {
    const carrinho = carrinhoService.criarCarrinho();
    res.status(201).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export const verCarrinho = (req, res, next) => {
  try {
    const { carrinhoId } = req.params;
    const carrinho = carrinhoService.verCarrinho(carrinhoId);
    res.status(200).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export const adicionarItem = async (req, res, next) => {
  try {
    const { carrinhoId } = req.params;
    const { perfumeId, quantidade } = req.body;
    
    // Validação básica de entrada antes de chamar o serviço
    if (!perfumeId) {
        return res.status(400).json({ success: false, message: 'perfumeId é obrigatório' });
    }

    const carrinho = await carrinhoService.adicionarItem(carrinhoId, perfumeId, quantidade);
    res.status(200).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export const atualizarQuantidade = async (req, res, next) => {
  try {
    const { carrinhoId, perfumeId } = req.params;
    const { quantidade } = req.body;
    
    const carrinho = await carrinhoService.atualizarQuantidade(carrinhoId, perfumeId, quantidade);
    res.status(200).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export const removerItem = (req, res, next) => {
  try {
    const { carrinhoId, perfumeId } = req.params;
    const carrinho = carrinhoService.removerItem(carrinhoId, perfumeId);
    res.status(200).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export const limparCarrinho = (req, res, next) => {
  try {
    const { carrinhoId } = req.params;
    const carrinho = carrinhoService.limparCarrinho(carrinhoId);
    res.status(200).json({ success: true, data: carrinho });
  } catch (error) {
    next(error);
  }
};

export default {
  criarCarrinho,
  verCarrinho,
  adicionarItem,
  atualizarQuantidade,
  removerItem,
  limparCarrinho,
};