import { z } from 'zod';

// Schema para adicionar um item ao carrinho
export const adicionarItemSchema = z.object({
  perfumeId: z.coerce.number({ required_error: "ID do perfume é obrigatório" }), // coerce garante que se vier string numérico, vira number
  quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1").default(1)
});

// Schema para atualizar a quantidade de um item
export const atualizarItemSchema = z.object({
  quantidade: z.number().int().describe("Se for < 1, o item será removido pelo service")
});

// Opcional: Schema de resposta (para garantir que o front receba o formato certo)
export const carrinhoResponseSchema = z.object({
  id: z.string(),
  vendorId: z.number().nullable(),
  total: z.number(),
  items: z.array(z.object({
    perfumeId: z.number(),
    nome: z.string(),
    preco: z.number(),
    quantidade: z.number(),
    vendedorId: z.number()
  }))
});
