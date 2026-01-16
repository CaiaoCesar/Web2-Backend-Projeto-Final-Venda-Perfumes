import { z } from 'zod';

// Esquema Base: Define as regras de cada campo
const perfumeBase = {
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  marca: z.string().min(2, "A marca é obrigatória"),
  descricao: z.string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
  preco: z.number().positive("O preço deve ser um valor maior que zero"),
  frasco: z.number().positive("O volume do frasco deve ser positivo"),
  quantidade_estoque: z.number().int().nonnegative("O estoque não pode ser negativo"),
  foto: z.string().url("A foto deve ser uma URL válida").optional().or(z.string().nullable()),
};

//Esquema para criação dos perfumes
export const esquemaCriacaoPerfume = z.object({
// Essa linha insere todas as variéveis definidas em perfumeBase
  ...perfumeBase 
});

//Esquema para editar perfumes
export const esquemaEditarPerfume = z.object({
  ...perfumeBase
}).partial(); // Torna opcionais

//Esquema para editar estoque
export const esquemaEditarEstoque = z.object({
  quantidade_estoque: perfumeBase.quantidade_estoque
});