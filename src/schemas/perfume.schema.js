// src/schemas/perfume.schema.js
import { z } from 'zod';

/**
 * Schema para criação de perfume
 * Valida todos os campos obrigatórios e opcionais
 */
export const esquemaCriacaoPerfume = z.object({
  nome: z
    .string({
      required_error: 'Nome é obrigatório',
      invalid_type_error: 'Nome deve ser uma string',
    })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  marca: z
    .string({
      required_error: 'Marca é obrigatória',
      invalid_type_error: 'Marca deve ser uma string',
    })
    .min(2, 'Marca deve ter no mínimo 2 caracteres')
    .max(50, 'Marca deve ter no máximo 50 caracteres')
    .trim(),

  preco: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) throw new Error('Preço inválido');
      return num;
    })
    .refine((val) => val > 0, {
      message: 'Preço deve ser maior que zero',
    }),

  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
    .nullable(),

  frasco: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (!val || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return null;
      return num;
    })
    .refine((val) => val === null || val > 0, {
      message: 'Frasco deve ser maior que zero',
    })
    .optional()
    .nullable(),

  quantidade_estoque: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (!val || val === '') return 0;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return 0;
      return num;
    })
    .refine((val) => val >= 0, {
      message: 'Quantidade não pode ser negativa',
    })
    .optional()
    .default(0),

  foto: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => {
      // Se não houver foto, retorna null
      if (!val || val === '') return null;
      return val;
    }),
});

/**
 * Schema para edição de perfume
 * Todos os campos são opcionais
 */
export const esquemaEditarPerfume = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),

  marca: z
    .string()
    .min(2, 'Marca deve ter no mínimo 2 caracteres')
    .max(50, 'Marca deve ter no máximo 50 caracteres')
    .trim()
    .optional(),

  preco: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) throw new Error('Preço inválido');
      return num;
    })
    .refine((val) => val > 0, {
      message: 'Preço deve ser maior que zero',
    })
    .optional(),

  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
    .nullable(),

  frasco: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (!val || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return null;
      return num;
    })
    .refine((val) => val === null || val > 0, {
      message: 'Frasco deve ser maior que zero',
    })
    .optional()
    .nullable(),

  quantidade_estoque: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (!val || val === '') return undefined;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val === undefined || val >= 0, {
      message: 'Quantidade não pode ser negativa',
    })
    .optional(),

  foto: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => {
      if (!val || val === '') return null;
      return val;
    }),
});

/**
 * Schema para edição de estoque
 * Apenas quantidade_estoque é obrigatória
 */
export const esquemaEditarEstoque = z.object({
  quantidade_estoque: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) {
        throw new Error('Quantidade inválida');
      }
      return num;
    })
    .refine((val) => val >= 0, {
      message: 'O estoque não pode ser negativo',
    }),
});