import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/config/database.js';

describe('Feature: Busca de Produtos por Localidade', () => {
  let vendedorSP_Id;
  let vendedorRJ_Id;

  beforeAll(async () => {
    // 1. Criar Vendedor em SP
    const vendedorSP = await prisma.vendedor.create({
      data: {
        nome: 'Vendedor SP',
        email: `sp_${Date.now()}@teste.com`,
        senha: '123',
        telefone: '11999999999',
        estado: 'SP',
        cidade: 'São Paulo',
        nome_loja: 'Loja Paulista'
      }
    });
    vendedorSP_Id = vendedorSP.id;

    // 2. Criar Vendedor no RJ
    const vendedorRJ = await prisma.vendedor.create({
      data: {
        nome: 'Vendedor RJ',
        email: `rj_${Date.now()}@teste.com`,
        senha: '123',
        telefone: '21999999999',
        estado: 'RJ',
        cidade: 'Rio de Janeiro',
        nome_loja: 'Loja Carioca'
      }
    });
    vendedorRJ_Id = vendedorRJ.id;

    // 3. Criar Perfumes para SP
    await prisma.perfume.create({
      data: {
        nome: 'Perfume Paulista',
        marca: 'Natura',
        preco: 100.00,
        foto: 'foto1',
        descricao: 'Desc SP',
        frasco: 100,
        vendedorId: vendedorSP_Id,
        quantidade_estoque: 10
      }
    });

    // 4. Criar Perfumes para RJ
    await prisma.perfume.create({
      data: {
        nome: 'Perfume Carioca',
        marca: 'Boticario',
        preco: 100.00,
        foto: 'foto2',
        descricao: 'Desc RJ',
        frasco: 100,
        vendedorId: vendedorRJ_Id,
        quantidade_estoque: 10
      }
    });
  });

  afterAll(async () => {
    await prisma.perfume.deleteMany({ where: { OR: [{ vendedorId: vendedorSP_Id }, { vendedorId: vendedorRJ_Id }] } });
    await prisma.vendedor.deleteMany({ where: { id: { in: [vendedorSP_Id, vendedorRJ_Id] } } });
    await prisma.$disconnect();
  });

  it('Deve retornar APENAS perfumes de São Paulo quando filtrado por SP', async () => {
    const response = await request(app)
      .get('/api/v2/buscas')
      .query({ cidade: 'São Paulo', estado: 'SP' });
    
    expect(response.status).toBe(200);
    const perfumes = response.body.dados.produtos;
    
    expect(perfumes.some(p => p.nome === 'Perfume Paulista')).toBe(true);
    expect(perfumes.some(p => p.nome === 'Perfume Carioca')).toBe(false);
  });

  it('Deve retornar APENAS perfumes do Rio de Janeiro quando filtrado por RJ', async () => {
    const response = await request(app)
      .get('/api/v2/buscas')
      .query({ cidade: 'Rio de Janeiro', estado: 'RJ' });
    
    expect(response.status).toBe(200);
    const perfumes = response.body.dados.produtos;
    
    expect(perfumes.some(p => p.nome === 'Perfume Carioca')).toBe(true);
    expect(perfumes.some(p => p.nome === 'Perfume Paulista')).toBe(false);
  });

  it('Deve retornar erro 400 (Bad Request) se não enviar cidade e estado', async () => {
    const response = await request(app).get('/api/v2/buscas?termo=Perfume');
    
    expect(response.status).not.toBe(200); 
  });
});