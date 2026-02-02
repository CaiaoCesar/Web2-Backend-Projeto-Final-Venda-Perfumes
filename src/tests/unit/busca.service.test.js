import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as buscaService from '../../services/busca.service.js';

const { mPrisma } = vi.hoisted(() => {
  return {
    mPrisma: {
      perfume: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: vi.fn().mockImplementation(function() {
      return mPrisma;
    }),
  };
});

describe('Unit: Busca Service', () => {
  // Configuração padrão de localidade para os testes
  const localidadePadrao = { cidade: 'São Paulo', estado: 'SP' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve filtrar obrigatoriamente pela localidade do vendedor', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          vendedor: {
            cidade: { equals: 'São Paulo', mode: 'insensitive' },
            estado: { equals: 'SP', mode: 'insensitive' }
          }
        })
      })
    );
  });

  it('Deve aplicar filtro pelo nome junto com localidade', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    const filtros = {
      ...localidadePadrao,
      termo: 'Essencial',
      ordenar: 'mais_vendidos'
    };

    await buscaService.buscarPerfumes(filtros);

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          nome: { contains: 'Essencial', mode: 'insensitive' },
          vendedor: expect.any(Object)
        }
      })
    );
  });

  it('Deve filtrar por INTERVALO DE PREÇO', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao, precoMin: '100', precoMax: '200' });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          preco: { gte: 100, lte: 200 }
        })
      })
    );
  });

  it('Deve ordenar por MENOR PREÇO', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao, ordenar: 'menor_preco' });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { preco: 'asc' }
      })
    );
  });

  it('Deve ordenar por MAIOR PREÇO', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao, ordenar: 'maior_preco' });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { preco: 'desc' }
      })
    );
  });

  it('Deve aplicar ordenação PADRÃO (mais vendidos) quando parâmetro ordenar for omitido', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { pedidoItens: { _count: 'desc' } }
      })
    );
  });

  it('Deve filtrar apenas por PREÇO MÍNIMO (sem máximo)', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    await buscaService.buscarPerfumes({ ...localidadePadrao, precoMin: '50' });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          preco: { gte: 50 } // Verifica se não enviou o lte
        })
      })
    );
  });

  it('Deve calcular paginação corretamente (skip e take)', async () => {
    mPrisma.perfume.count.mockResolvedValue(0);
    mPrisma.perfume.findMany.mockResolvedValue([]);

    const pagina = 3;
    const limite = 20;
    
    // Cálculo esperado: skip = (3 - 1) * 20 = 40
    await buscaService.buscarPerfumes({ ...localidadePadrao, pagina, limite });

    expect(mPrisma.perfume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 40,
        take: 20
      })
    );
  });

  it('Deve retornar estrutura correta de dados e metadados de paginação', async () => {
    mPrisma.perfume.count.mockResolvedValue(25);
    
    const mockProdutos = [{ id: 1, nome: 'Perfume A' }, { id: 2, nome: 'Perfume B' }];
    mPrisma.perfume.findMany.mockResolvedValue(mockProdutos);

    const limite = 10;
    const pagina = 1;

    const resultado = await buscaService.buscarPerfumes({ ...localidadePadrao, pagina, limite });

    expect(resultado).toEqual({
      produtos: mockProdutos,
      paginacao: {
        total: 25,
        paginaAtual: 1,
        totalPaginas: 3,
        itensPorPagina: 10
      }
    });
  });
});