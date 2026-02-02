// tests/setup.js
import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🧪 Iniciando suite de testes...');

// Limpar banco ANTES de todos os testes
beforeAll(async () => {
  await prisma.perfume.deleteMany();
  await prisma.vendedor.deleteMany();
  console.log('✅ Ambiente de teste configurado');
});

// NÃO USE beforeEach - deixe os testes gerenciarem a limpeza

// Limpar e desconectar DEPOIS de todos os testes
afterAll(async () => {
  await prisma.perfume.deleteMany();
  await prisma.vendedor.deleteMany();
  await prisma.$disconnect();
  console.log('✅ Testes finalizados e conexão fechada');
});
