import bcrypt from 'bcryptjs/dist/bcrypt.js';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';

// Verfica se o vendedor existe pelo email
export const vendedorExiste = async (email) => {
  const vendedor = await prisma.vendedor.findFirst({
    where: { email: email },
  });
  return !!vendedor;
};

// Verifica se o vendedor existe pelo email
export const lojaExiste = async (nome_loja) => {
  const vendedor = await prisma.vendedor.findFirst({
    where: { nome_loja: nome_loja },
  });
  return !!vendedor;
};

// Cria um novo vendedor
export const criarVendedor = async (vendedorDados) => {
  const verificaVendedorExiste = await vendedorExiste(vendedorDados.email);
  if (verificaVendedorExiste) {
    throw new Error('Existe um Vendedor com este email já registrado');
  }
  // Verifica existência da loja do vendedor
  const verificaLojaExiste = await lojaExiste(vendedorDados.nome_loja);
    if (verificaLojaExiste) {
      throw new Error('Já existe uma loja registrada com este nome');
    }
  

  // Transforma os saltos da variável do ambiente para numero
  const saltos = Number(process.env.SALTS_BYCRIPT) || 10;

  // Criptografa a senha
  const senhaCriptografada = await bcrypt.hash(vendedorDados.senha, saltos);
  return await prisma.vendedor.create({
    data: {
      nome: vendedorDados.nome,
      email: vendedorDados.email,
      senha: senhaCriptografada,
      telefone: vendedorDados.telefone,
      estado: vendedorDados.estado,
      cidade: vendedorDados.cidade,
      nome_loja: vendedorDados.nome_loja,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      estado: true,
      cidade: true,
      nome_loja: true,
    },
  });
};

// Validação do usuário e criação do token de acesso (JWT)
export const autenticarVendedor = async (email, senha) => {
  // Busca vendedor através do email
  const vendedor = await prisma.vendedor.findUnique({ where: { email } });
  // Verifica se o vendedor existe
  if (!vendedor) throw new Error('Credenciais inválidas');

  // 2. Valida a senha
  const senhaValida = await bcrypt.compare(senha, vendedor.senha);
  // Se a senha não for a senha correta, apresenta erro
  if (senhaValida === false) throw new Error('Credenciais inválidas');

  // 3. Gera o Token
  const token = jwt.sign({ id: vendedor.id, email: vendedor.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRATION_TIME || '5h',
  });

  // Remove o campo senha do vendedor
  const { senha: _, ...vendedorSemSenha } = vendedor;

  // Retorna o vendedor sem a senha e o token
  return { vendedor: vendedorSemSenha, token };
};

export default {
  autenticarVendedor,
  criarVendedor,
};
