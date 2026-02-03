import * as pedidoService from '../services/pedido.service.js';
import * as carrinhoService from '../services/carrinho.service.js';
import { AppError } from '../utils/appError.js';

export const criarPedido = async (req, res, next) => {
  try {
    const { nome, telefone, carrinhoId } = req.body;
    if (!nome || !telefone || !carrinhoId) throw new AppError('Dados incompletos', 400);

    const carrinho = carrinhoService.verCarrinho(carrinhoId);

    if (!carrinho.items || carrinho.items.length === 0) {
      throw new AppError('O carrinho está vazio. Adicione itens antes de finalizar.', 400);
    }

    const pedido = await pedidoService.criarPedido({ 
      nomeCliente: nome, 
      telefoneCliente: telefone, 
      carrinho 
    });

    carrinhoService.limparCarrinho(carrinhoId);

    return res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

export const listarPedidos = async (req, res, next) => {
  try {
    const vendedorId = req.user && req.user.id;
    if (!vendedorId) throw new AppError('Não autorizado', 401);

    const pedidos = await pedidoService.listarPedidos(vendedorId);
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

export const buscarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendedorId = req.user && req.user.id;
    const pedido = await pedidoService.buscarPorId(id, vendedorId);
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

export const atualizarStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new AppError('Status é obrigatório', 400);
    const vendedorId = req.user && req.user.id;
    const atualizado = await pedidoService.atualizarStatus(id, vendedorId, status);
    res.json(atualizado);
  } catch (error) {
    next(error);
  }
};

export const atualizarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendedorId = req.user && req.user.id;
    const atualizado = await pedidoService.atualizarPedido(id, vendedorId, req.body);
    res.json(atualizado);
  } catch (error) {
    next(error);
  }
};

export default {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatus,
  atualizarPedido,
};