import { z } from 'zod';

const regrasPerfume = {
  nome: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100),
  marca: z.string().trim().min(2, 'Mínimo 2 caracteres').max(50),
  
  // Conversão automática de string para número (útil para dados vindos de formulários/multipart)
  preco: z.coerce
    .number({ 
      invalid_type_error: 'O preço deve ser um número válido (ex: 150.50)',
      required_error: 'O preço é obrigatório' 
    })
    .positive('O preço deve ser maior que zero'),

  descricao: z.string().trim().min(10, 'Mínimo 10 caracteres').max(500),

  // Conversão de tipo para garantir que o volume seja tratado como numeral
  frasco: z.coerce
    .number({ 
      invalid_type_error: 'O volume do frasco deve ser um número inteiro (ex: 100)' 
    })
    .positive('O volume deve ser maior que zero'),

  quantidade_estoque: z.coerce
    .number({ 
      invalid_type_error: 'A quantidade em estoque deve ser um número inteiro (ex: 10)' 
    })
    .int('A quantidade deve ser um número inteiro')
    .nonnegative('A quantidade não pode ser negativa')
    .default(0), // Define 0 caso o valor não seja enviado
  foto: z.string().min(1, 'A foto é obrigatória'), // min(1), garante que exista ao menos 1 caracter na URL
};

export const esquemaCriacaoPerfume = z.object(regrasPerfume);

// Remoção do estoque da edição geral e transformação dos campos em opcionais para editar apenas o que quiser
export const esquemaEditarPerfume = esquemaCriacaoPerfume
  .omit({ quantidade_estoque: true })
  .partial();

// Isolamento da regra de estoque para atualizações específicas
export const esquemaEditarEstoque = z.object({
  quantidade_estoque: regrasPerfume.quantidade_estoque,
});

export const esquemaListagemPerfumes = z.object({
  nome: z.string().trim().min(1, 'Nome deve ter pelo menos 1 caractere').optional(),

  // Regras de paginação com conversão de tipo e valores iniciais padrão
  page: z.coerce
    .number()
    .int('Página deve ser um número inteiro')
    .positive('Página deve ser maior que zero')
    .default(1),

  limit: z.coerce
    .number()
    .int('Limite deve ser um número inteiro')
    .positive('Limite deve ser maior que zero')
    .max(100, 'Limite máximo é 100 itens por página')
    .default(10),
});