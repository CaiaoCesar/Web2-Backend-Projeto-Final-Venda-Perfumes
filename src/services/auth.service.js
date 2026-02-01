import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js'; // Importe a classe nova

export const vendedorExiste = async (email) => {
  const vendedor = await prisma.vendedor.findFirst({ where: { email } });
  return !!vendedor;
};

export const lojaExiste = async (nome_loja) => {
  const vendedor = await prisma.vendedor.findFirst({ where: { nome_loja } });
  return !!vendedor;
};

export const criarVendedor = async (vendedorDados) => {
  // 1. Validação de e-mail duplicado
  if (await vendedorExiste(vendedorDados.email)) {
    throw new AppError('Este e-mail já está registrado.', 400); // Erro 400
  }

  // 2. Validação de nome de loja duplicado
  if (await lojaExiste(vendedorDados.nome_loja)) {
    throw new AppError('Este nome de loja já está em uso.', 400); // Erro 400
  }

  //Transforma os saltos da variável do ambiente para numero
  const saltos = Number(process.env.SALTS_BYCRIPT) || 10;

  //Criptografa a senha
  const senhaCriptografada = await bcrypt.hash(vendedorDados.senha, saltos);

  return await prisma.vendedor.create({
    data: { ...vendedorDados, senha: senhaCriptografada },
    select: { id: true, nome: true, email: true, nome_loja: true },
  });
};

export const autenticarVendedor = async (email, senha) => {
  const vendedor = await prisma.vendedor.findUnique({ where: { email } });

  // 3. Erro de Login (Vendedor não encontrado ou senha errada)
  if (!vendedor || !(await bcrypt.compare(senha, vendedor.senha))) {
    throw new AppError('E-mail ou senha incorretos', 401); 
  }

  const token = jwt.sign(
    { id: vendedor.id, email: vendedor.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.EXPIRATION_TIME || '5h' }
  );

  const { senha: _, ...vendedorSemSenha } = vendedor;
  return { vendedor: vendedorSemSenha, token };
};