import { z } from 'zod';

const esquemaItem = z.object({
  perfumeId: z.number().int().positive('perfumeId deve ser um número inteiro positivo'),
  quantidade: z.number().int().min(1, 'Quantidade mínima é 1'),
});

export const esquemaCriarPedido = z.object({
  vendedorId: z.number().int().positive('vendedorId deve ser um número inteiro positivo'),
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z
    .string()
    .min(10, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    .regex(/^[0-9()+\-\s]+$/, 'Telefone deve conter apenas dígitos e caracteres de formatação'),
  carrinhoId: z.string().min(1, 'ID do carrinho é obrigatório'),
});

export const esquemaAtualizarStatus = z.object({
  status: z.enum(['PENDENTE', 'CONFIRMADO'], {
    errorMap: () => ({ message: 'Status deve ser "PENDENTE" ou "CONFIRMADO"' }),
  }),
});

export default { esquemaCriarPedido, esquemaAtualizarStatus };