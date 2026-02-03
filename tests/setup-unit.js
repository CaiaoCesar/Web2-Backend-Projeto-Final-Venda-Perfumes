// tests/setup-unit.js
import { vi } from 'vitest';

// Criação de objeto simulado (mock) do Prisma para rodar testes sem banco de dados real
const mockPrisma = {
  // Simulação das funções de perfume para evitar chamadas reais ao banco de dados
  perfume: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  // Simulação das funções de vendedor para isolar a lógica de cadastro e login
  vendedor: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  // Simulação do encerramento de conexão para evitar erros de finalização
  $disconnect: vi.fn(),
};

// Substituição do arquivo de configuração original pelo objeto simulado durante os testes
vi.mock('../../src/config/database.js', () => ({
  default: mockPrisma,
}));

// Simulação do bcryptjs para agilizar a execução sem processar criptografia real
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

// Simulação do jsonwebtoken para validar a criação de tokens de forma simplificada
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

// Confirmação visual no terminal de que as simulações estão ativas
console.log('Mocks configurados para testes unitários');