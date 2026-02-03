import * as checkoutService from '../services/checkout.service.js';
import * as carrinhoService from '../services/carrinho.service.js'; //
import { AppError } from '../utils/appError.js';

/**
 * POST /api/v2/checkout/whatsapp
 * Recebe nome, telefone e carrinhoId.
 * Busca os itens reais no serviço de carrinho e gera o link.
 */
export const checkoutWhatsApp = async (req, res, next) => {
  try {
    const { nome, telefone, carrinhoId } = req.body;

    // 1. Buscar o carrinho validado no servidor
    const carrinho = carrinhoService.verCarrinho(carrinhoId);

    // 2. Validações adicionais de negócio
    if (!carrinho.items || carrinho.items.length === 0) {
      throw new AppError('O carrinho está vazio. Adicione itens antes de finalizar.', 400);
    }

    // 3. Formatar telefone
    const telefoneFormatado = checkoutService.formatarTelefone(telefone);

    // 4. Gerar mensagem usando os itens CONFIÁVEIS do backend
    const mensagem = checkoutService.gerarMensagemDoCarrinho({
      nomeCliente: nome,
      items: carrinho.items,
      valorTotal: carrinho.total,
    });

    // 5. Gerar link
    const link = checkoutService.gerarLinkWhatsApp({ telefoneFormatado, mensagem });

    // Redireciona o cliente para o WhatsApp
    return res.redirect(link);
  } catch (error) {
    next(error);
  }
};

export default { checkoutWhatsApp };
