import { z } from 'zod';

/**
 * Schema de Validação: Vendedor
 * ---------------------------------------------------------------------
 * Define o "contrato" de dados obrigatórios para que seja cadastrado um vendedor
 * O Zod atua como um "porteiro", garantindo que apenas dados limpos e no formato correto consigam chegar ao Controller e ao Banco de Dados
 */

export const vendedorSchema = z.object({

  // Garante que não sejam enviados nomes vazios ou apelidos muito curtos
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(3, 'O nome deve ter pelo menos 3 caracteres'),

  // Valida automaticamente se tem "@" e domínio
  email: z.string({ required_error: 'O e-mail é obrigatório' }).email('Insira um e-mail válido'),

  // Verifica se a senha possui as 8 caracteres
  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),

  // O Regex garante que venham apenas números (sem traços, parênteses ou espaços)
  // O lenght vai garantir o formato DDD (2) + 9 + Número (8) = 11 dígitos
  telefone: z
    .string({ required_error: 'O telefone é obrigatório' })
    .regex(/^\d+$/, 'O telefone deve conter apenas números')
    .length(11, 'O telefone deve ter exatamente 11 números (DDD + 9 + número)'),

  // Além de validar o tamanho, usamos o .transform() para converter automaticamente "mg" para "MG"
  estado: z
    .string({ required_error: 'O estado é obrigatório' })
    .length(2, 'Use a sigla do estado com 2 letras (ex: MG)')
    .regex(/^[A-Za-z]+$/, 'A sigla deve conter apenas letras')
    .transform((val) => val.toUpperCase()), 

  // Verifica se a cidade possui minímo de 2 caracteres
  cidade: z
    .string({ required_error: 'A cidade é obrigatória' })
    .min(2, 'Nome da cidade muito curto'),

  //Verificação do mínimo de 5 caracteres para o nome da loja
  nome_loja: z
    .string({ required_error: 'O nome da loja é obrigatório' })
    .min(5, 'O nome da loja deve ter pelo menos 5 caracteres'),
});
