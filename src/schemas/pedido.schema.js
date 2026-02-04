import { z } from 'zod';

// Schema para criação de pedido (consistente com o corpo esperado em `pedido.controller.js`)
export const esquemaCriacaoPedido = z.object({
  nome: z.string().trim().min(1, 'Nome obrigatório'),
  telefone: z
    .string()
    .min(10, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    .regex(/^[0-9()+\-\s]+$/, 'Telefone deve conter apenas dígitos e caracteres de formatação'),
  carrinhoId: z.string().min(1, 'ID do carrinho é obrigatório'),
});

// Schema para atualização de status do pedido
export const esquemaAtualizarStatusPedido = z.object({
  status: z.enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'], {
    required_error: 'Status é obrigatório',
  }),
});

// Schema para atualização de dados do pedido (nome e telefone do cliente)
export const esquemaAtualizarPedido = z.object({
  nome_cliente: z.string().trim().min(1, 'Nome obrigatório').optional(),
  telefone_cliente: z
    .string()
    .min(10, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    .regex(/^[0-9()+\-\s]+$/, 'Telefone deve conter apenas dígitos e caracteres de formatação')
    .optional(),
});

export default { esquemaCriacaoPedido, esquemaAtualizarStatusPedido, esquemaAtualizarPedido };