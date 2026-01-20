import { z } from 'zod';

const regrasPerfume = {
  nome: z.string().trim().min(3, "Mínimo 3 caracteres").max(100),
  marca: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  preco: z.coerce.number().positive("O preço deve ser maior que zero"),
  descricao: z.string().trim().min(10, "Mínimo 10 caracteres").max(500),
  frasco: z.coerce.number().positive("O volume deve ser maior que zero"),
  
  // Se não for passado nada o sistema coloca 0 como padrão
  quantidade_estoque: z.coerce.number().int().nonnegative().default(0),
  
  // É obrigatório ter uma foto na criação
  foto: z.string().min(1, "A foto é obrigatória")
};

export const esquemaCriacaoPerfume = z.object(regrasPerfume);

// Todos os campos viram opcionais, exceto quantidade de de estoque, mas seguindo as regras do perfume
export const esquemaEditarPerfume = esquemaCriacaoPerfume
  .omit({ quantidade_estoque: true })
  .partial();

// Atualiza a quantidade de estoque, se não for passado nenhum valor é atualizado como 0
export const esquemaEditarEstoque = z.object({
  quantidade_estoque: regrasPerfume.quantidade_estoque
});