import { z } from 'zod';

export const esquemaCheckoutWhatsApp = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  telefone: z
    .string()
    .min(10, 'Telefone muito curto')
    .max(20, 'Telefone muito longo')
    // Aceita formatos comuns e limpa depois no service
    .regex(/^[0-9()+\-\s]+$/, 'Telefone deve conter apenas dígitos e caracteres de formatação'),
  carrinhoId: z.string().min(1, 'ID do carrinho é obrigatório'),
});

export default { esquemaCheckoutWhatsApp };