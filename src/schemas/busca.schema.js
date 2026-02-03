import { z } from 'zod';

export const esquemaListagemPerfumes = z.object({
  cidade: z.string({ required_error: "A cidade é obrigatória" }).trim().min(1),
  estado: z.string({ required_error: "O estado é obrigatório" }).trim().length(2, "O estado deve ser a sigla (UF) com 2 letras"),

  termo: z.string().trim().min(1, "Nome deve ter pelo menos 1 caractere").optional(),
  precoMin: z.coerce.number().min(0).optional(),
  precoMax: z.coerce.number().min(0).optional(),
  
  ordenar: z.enum(['menor_preco', 'maior_preco', 'mais_vendidos']).default('mais_vendidos'),

  pagina: z.coerce
    .number()
    .int("Página deve ser um número inteiro")
    .positive("Página deve ser maior que zero")
    .min(1)
    .default(1),

  limite: z.coerce
    .number()
    .int("Limite deve ser um número inteiro")
    .positive("Limite deve ser maior que zero")
    .min(1)
    .max(100, "Limite máximo é 100 itens por página")
    .default(10),
});