import * as pedidosService from '../services/pedidos.service.js';

/**
 * POST /api/v2/pedidos
 * Recebe vendedorId, nome, telefone e carrinhoId.
 * Cria o pedido a partir do carrinho no servidor.
 */
export const criarPedido = async (req, res) => {
  const { vendedorId, nome, telefone, carrinhoId } = req.body;

  const pedido = await pedidosService.criarPedido({
    vendedorId,
    nome,
    telefone,
    carrinhoId,
  });

  return res.status(201).json({
    mensagem: 'Pedido criado com sucesso.',
    pedido,
  });
};

/**
 * GET /api/v2/pedidos
 * Retorna pedidos do vendedor autenticado.
 * Filtro opcional via query: ?status=PENDENTE | CONFIRMADO
 */
export const listarPedidos = async (req, res) => {
  const vendedorId = req.user.id;
  const { status } = req.query;

  // Ignora o filtro se o valor não for válido
  const statusValidos = ['PENDENTE', 'CONFIRMADO'];
  const filtroStatus = status && statusValidos.includes(status) ? status : undefined;

  const pedidos = await pedidosService.listarPedidos(vendedorId, filtroStatus);

  return res.status(200).json({ pedidos });
};

/**
 * GET /api/v2/pedidos/:id
 * Retorna detalhes de um pedido do vendedor autenticado.
 */
export const buscarPedido = async (req, res) => {
  const vendedorId = req.user.id;
  const { id: pedidoId } = req.params;

  const pedido = await pedidosService.buscarPedido(pedidoId, vendedorId);

  return res.status(200).json({ pedido });
};

/**
 * PATCH /api/v2/pedidos/:id/status
 * Atualiza o status de um pedido do vendedor autenticado.
 * Recebe { status } no body.
 */
export const atualizarStatus = async (req, res) => {
  const vendedorId = req.user.id;
  const { id: pedidoId } = req.params;
  const { status: novoStatus } = req.body;

  const pedido = await pedidosService.atualizarStatusPedido(pedidoId, vendedorId, novoStatus);

  return res.status(200).json({
    mensagem: 'Status do pedido atualizado com sucesso.',
    pedido,
  });
};

/**
 * PATCH /api/v2/pedidos/:id/whatsapp
 * Marca a mensagem WhatsApp do pedido como enviada.
 */
export const marcarWhatsappEnviado = async (req, res) => {
  const { id: pedidoId } = req.params;

  await pedidosService.marcarWhatsappEnviado(pedidoId);

  return res.status(200).json({
    mensagem: 'Mensagem WhatsApp marcada como enviada.',
  });
};

export default {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatus,
  marcarWhatsappEnviado,
};