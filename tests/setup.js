// tests/setup.js
import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Iniciando suite de testes');

// Limpa o banco antes de todos os testes
beforeAll(async () => {
  await prisma.perfume.deleteMany();
  await prisma.vendedor.deleteMany();
  console.log('Ambiente de teste configurado');
});

// Limpa e desconecta depois de todos os testes
afterAll(async () => {
  await prisma.perfume.deleteMany();
  await prisma.vendedor.deleteMany();
  await prisma.$disconnect();
  console.log('Testes finalizados e conexão fechada');
});
