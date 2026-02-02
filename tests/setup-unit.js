// tests/setup-unit.js
import { vi } from 'vitest';

// Mock do Prisma para testes unitários
const mockPrisma = {
  perfume: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn()
  },
  vendedor: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn()
  },
  $disconnect: vi.fn()
};

vi.mock('../../src/config/database.js', () => ({
  default: mockPrisma
}));

// Mock bcrypt e jwt
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn()
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn()
}));

console.log('🧪 Mocks configurados para testes unitários');