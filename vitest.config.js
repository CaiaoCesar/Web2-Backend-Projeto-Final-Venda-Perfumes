import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// 1. FORÇAR O CARREGAMENTO: Isso deve vir antes do defineConfig
// Isso garante que o Vitest ignore o .env e use o .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'prisma/', '*.config.js'],
    },
    testTimeout: 10000,
    // Garante que os testes rodem um por um para não dar conflito no banco
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});