import { URLSearchParams } from 'url';

export const formatarTelefone = (telefone) => {
  const apenasDigitos = telefone.replace(/[^0-9]/g, '');
  if (apenasDigitos.length === 10 || apenasDigitos.length === 11) {
    return `55${apenasDigitos}`;
  }
  return apenasDigitos;
};

export const gerarMensagemDoCarrinho = ({ nomeCliente, items, valorTotal }) => {
  const linhasProdutos = items.map((it) => {
    const nome = it.nome || 'Produto';
    const quantidade = it.quantidade ?? 1;
    const preco = typeof it.preco === 'number' ? it.preco.toFixed(2) : '0.00';
    return `${quantidade}x ${nome} - R$ ${preco}`;
  });

  // Usa o valorTotal passado pelo controller, garantindo consistência com o carrinho
  const totalFormatado = Number(valorTotal).toFixed(2);

  const mensagem = [
    `Olá, meu nome é ${nomeCliente}. Gostaria de fazer um pedido.`,
    '',
    'Produtos:',
    ...linhasProdutos,
    '',
    `Total: R$ ${totalFormatado}`,
  ].join('\n');

  return mensagem;
};

export const gerarLinkWhatsApp = ({ telefoneFormatado, mensagem }) => {
  const params = new URLSearchParams();
  params.set('text', mensagem);
  return `https://wa.me/${telefoneFormatado}?${params.toString()}`;
};

export default { formatarTelefone, gerarMensagemDoCarrinho, gerarLinkWhatsApp };