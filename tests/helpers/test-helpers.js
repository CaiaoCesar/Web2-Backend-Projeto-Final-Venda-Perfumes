import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados padrão para evitar repetição
export const vendedorPadrao = {
  nome: 'Vendedor Teste',
  email: 'teste@exemplo.com',
  senha: 'Senha123!',
  telefone: '31999999999',
  estado: 'MG',
  cidade: 'Salinas',
  nome_loja: 'Loja de Testes Profissional',
};

/**
 * Cria um vendedor com e-mail e loja garantidamente únicos para evitar erro P2002.
 */
export async function criarVendedorTeste(dadosPersonalizados = {}) {
  // O uso de sufixo aleatório impede colisões em testes paralelos
  const randomSuffix = Math.floor(Math.random() * 999999);

  const dados = {
    ...vendedorPadrao,
    email: `vendedor-${Date.now()}-${randomSuffix}@teste.com`,
    nome_loja: `Loja ${randomSuffix}`,
    ...dadosPersonalizados,
  };

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  return await prisma.vendedor.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      telefone: dados.telefone,
      estado: dados.estado,
      cidade: dados.cidade,
      nome_loja: dados.nome_loja,
    },
  });
}

/**
 * Gera um token JWT idêntico ao que o seu sistema gera no login real.
 * IMPORTANTE: O payload deve conter 'id' para bater com seu authMiddleware.
 */
export function gerarTokenTeste(vendedorId, email) {
  return jwt.sign({ id: vendedorId, email: email }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '24h',
  });
}

/**
 * Remove os dados respeitando a integridade referencial.
 */
export async function limparBanco() {
  // SEMPRE delete perfumes antes de vendedores
  await prisma.perfume.deleteMany();
  await prisma.vendedor.deleteMany();
}

/**
 * Cria um perfume vinculado ao vendedorId fornecido.
 */
export async function criarPerfumeTeste(vendedorId, dadosPersonalizados = {}) {
  const perfumePadrao = {
    nome: `Perfume Teste ${Math.random().toString(36).substring(7)}`,
    marca: 'Marca Teste',
    quantidade_estoque: 10,
    foto: 'https://ucarecdn.com/uuid-exemplo/',
    preco: 99.99,
    descricao: 'Descrição para ambiente de testes',
    frasco: 100.0,
  };

  const dados = { ...perfumePadrao, ...dadosPersonalizados };

  return await prisma.perfume.create({
    data: {
      ...dados,
      vendedorId, // Essencial para evitar erro P2003
    },
  });
}

/**
 * Facilita testes de paginação.
 */
export async function criarMultiplosPerfumes(vendedorId, quantidade) {
  const perfumes = [];
  for (let i = 1; i <= quantidade; i++) {
    const perfume = await criarPerfumeTeste(vendedorId, {
      nome: `Perfume ${i} - ${Date.now()}`,
      preco: 50 + i,
    });
    perfumes.push(perfume);
  }
  return perfumes;
}

export { limparBanco as resetarBanco };
