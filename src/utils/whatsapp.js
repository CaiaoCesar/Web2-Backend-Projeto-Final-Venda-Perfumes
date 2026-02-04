import { URLSearchParams } from 'url';

export const formatarTelefone = (telefone) => {
  const apenasDigitos = telefone.replace(/[^0-9]/g, '');
  if (apenasDigitos.length === 10 || apenasDigitos.length === 11) {
    return `55${apenasDigitos}`;
  }
  return apenasDigitos;
};

export const gerarMensagemDoCarrinho = ({ 
  nomeCliente, 
  telefoneCliente, 
  nomeVendedor, 
  items, 
  valorTotal, 
  pedidoId 
}) => {
  const linhasProdutos = items.map((it) => {
    const nome = it.nome || 'Produto';
    const quantidade = it.quantidade ?? 1;
    const preco = typeof it.preco === 'number' ? Number(it.preco).toFixed(2) : '0.00';
    return `- ${quantidade}x ${nome} (R$ ${preco})`;
  }).join('\n');

  const totalFormatado = Number(valorTotal).toFixed(2);
  const nomeVendedorFormatado = nomeVendedor || 'Vendedor';

  return `Olá ${nomeVendedorFormatado},\n` +
    `Gostaria de comprar os seguintes itens:\n\n` +
    `${linhasProdutos}\n\n` +
    `Total: R$ ${totalFormatado}\n` +
    `Nome: ${nomeCliente}\n` +
    `Telefone: ${telefoneCliente}\n` +
    `Pedido ID: ${pedidoId}`;
};

export const gerarLinkWhatsApp = ({ telefoneFormatado, mensagem }) => {
  const params = new URLSearchParams();
  params.set('text', mensagem);
  return `https://wa.me/${telefoneFormatado}?${params.toString()}`;
};