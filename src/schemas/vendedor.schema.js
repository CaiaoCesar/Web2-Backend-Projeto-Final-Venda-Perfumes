import { z } from 'zod';

export const vendedorSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),

  email: z.string({ required_error: 'O e-mail é obrigatório' }).email('Insira um e-mail válido'),

  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),

  telefone: z
    .string({ required_error: 'O telefone é obrigatório' })
    .regex(/^\d+$/, 'O telefone deve conter apenas números')
    .length(11, 'O telefone deve ter exatamente 11 números (DDD + 9 + número)'),

  estado: z
    .string({ required_error: 'O estado é obrigatório' })
    .length(2, 'Use a sigla do estado com 2 letras (ex: MG)')
    .regex(/^[A-Za-z]+$/, 'A sigla deve conter apenas letras')
    .transform(val => val.toUpperCase()), // Converte siglas minusculas para maiusculas

  cidade: z
    .string({ required_error: 'A cidade é obrigatória' })
    .min(2, 'Nome da cidade muito curto'),
});
