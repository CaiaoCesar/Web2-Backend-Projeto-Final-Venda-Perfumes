import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js'; 

/**
 * Auth Service (Camada de Regras de Negócio)
 * ---------------------------------------------------
 * Responsável pela lógica "pesada" de segurança:
 *  Criptografia de senhas (Hashing)
 *  Geração de Tokens JWT (assinatura digital)
 *  Validação de regras de unicidade (email e loja únicos)
 *  Proteção de dados sensíveis (sanitização de retorno)
 */

export const vendedorExiste = async (email) => {
  // Irá verificar se será encontrado algum registro
  const vendedor = await prisma.vendedor.findFirst({ where: { email } });
  return !!vendedor;
};

export const lojaExiste = async (nome_loja) => {
  // Verifica se não existe lojas com nomes iguais
  const vendedor = await prisma.vendedor.findFirst({ where: { nome_loja } });
  return !!vendedor;
};

  // Cria um novo vendedor no banco de dados
export const criarVendedor = async (vendedorDados) => {
  // Validação de e-mail duplicado
  if (await vendedorExiste(vendedorDados.email)) {
    throw new AppError('Este e-mail já está registrado.', 400); 
  }

  // Validação de nome de loja duplicado
  if (await lojaExiste(vendedorDados.nome_loja)) {
    throw new AppError('Este nome de loja já está em uso.', 400); 
  }

  // Transforma os saltos da variável do ambiente para numero, trazendo aleatoriedade ao hash
  const saltos = Number(process.env.SALTS_BYCRIPT) || 10;

  // Criptografa a senha
  const senhaCriptografada = await bcrypt.hash(vendedorDados.senha, saltos);

  // Os campos que serão retornados para o controller/frontend, menos o campo 'senha'
  return await prisma.vendedor.create({
    data: { ...vendedorDados, senha: senhaCriptografada },
    select: { id: true, nome: true, email: true, nome_loja: true },
  });
};

  // Realiza a autenticação (login)
export const autenticarVendedor = async (email, senha) => {
  const vendedor = await prisma.vendedor.findUnique({ where: { email } });

  // Erro de Login (vendedor não encontrado ou senha errada), pois precisa ser genérico por segurança
  if (!vendedor || !(await bcrypt.compare(senha, vendedor.senha))) {
    throw new AppError('E-mail ou senha incorretos', 401);
  }

  // Geração do token JWT, possuindo o payload com informações e a assinatura 
  const token = jwt.sign({ id: vendedor.id, email: vendedor.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRATION_TIME || '5h',
  });

  // Iremos remover a propriedade 'senha' do objeto retornado usando destructuring
  // A variável '_' recebe a senha e será descartada
  const { senha: _, ...vendedorSemSenha } = vendedor;
  return { vendedor: vendedorSemSenha, token };
};
