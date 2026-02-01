// tests/helpers/test-helpers.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Vendedor padrão para testes
export const vendedorPadrao = {
  nome: 'Vendedor Teste',
  email: 'teste@exemplo.com',
  senha: 'Senha123!',
  telefone: '31999999999',
  estado: 'MG',
  cidade: 'Montes Claros',
  nome_loja: 'Loja Teste',
};

// Criar vendedor de teste

export async function criarVendedorTeste(dadosPersonalizados = {}) {
  // Gerar email único se não fornecido
  const emailUnico = dadosPersonalizados.email || `teste-${Date.now()}-${Math.random()}@exemplo.com`;
  
  const dados = { 
    ...vendedorPadrao, 
    ...dadosPersonalizados,
    email: emailUnico // ← Sobrescreve com email único
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

// Gerar token JWT
export function gerarTokenTeste(vendedorId) {
  return jwt.sign({ vendedorId }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '24h',
  });
}

// Limpar banco de dados
export async function limparBanco() {
  await prisma.perfume.deleteMany();  // ← MUDOU: produto → perfume
  await prisma.vendedor.deleteMany();
}

// Criar perfume de teste
export async function criarPerfumeTeste(vendedorId, dadosPersonalizados = {}) {
  const perfumePadrao = {
    nome: 'Perfume Teste',
    marca: 'Marca Teste',
    quantidade_estoque: 10,
    foto: 'https://exemplo.com/foto.jpg',
    preco: 99.99,
    descricao: 'Descrição do perfume teste',
    frasco: 100.0,
  };

  const dados = { ...perfumePadrao, ...dadosPersonalizados };

  return await prisma.perfume.create({
    data: {
      ...dados,
      vendedorId,
    },
  });
}

// Criar múltiplos perfumes de teste
export async function criarMultiplosPerfumes(vendedorId, quantidade) {
  const perfumes = [];
  
  for (let i = 1; i <= quantidade; i++) {
    const perfume = await criarPerfumeTeste(vendedorId, {
      nome: `Perfume ${i}`,
      marca: `Marca ${i}`,
      preco: 50 + i,
    });
    perfumes.push(perfume);
  }
  
  return perfumes;
}

export { criarVendedorTeste, gerarTokenTeste, limparBanco, criarPerfumeTeste, criarMultiplosPerfumes };