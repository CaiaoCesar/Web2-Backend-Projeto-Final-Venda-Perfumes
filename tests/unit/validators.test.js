// tests/unit/validators.test.js
import { describe, it, expect } from 'vitest';

import {
  esquemaCriacaoPerfume,
  esquemaEditarPerfume,
  esquemaEditarEstoque,
  esquemaListagemPerfumes,
} from '../../src/schemas/perfume.schema.js';

import { vendedorSchema } from '../../src/schemas/vendedor.schema.js';

describe('🛡️ Validadores Zod - Testes Unitários Críticos', () => {
  // ==========================================
  // PERFUME - Validações de Números
  // ==========================================
  describe('esquemaCriacaoPerfume - Validação de Números', () => {
    it('deve REJEITAR preço negativo', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: -100, // ❌ NEGATIVO
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow(
        'O preço deve ser maior que zero'
      );
    });

    it('deve REJEITAR preço zero', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 0, // ❌ ZERO NÃO É POSITIVO
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow(
        'O preço deve ser maior que zero'
      );
    });

    it('deve ACEITAR preço válido como string (coerção automática)', () => {
      const dados = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: '299.90', // ✅ String será convertida
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: '100', // ✅ String será convertida
        foto: 'https://foto.jpg',
        quantidade_estoque: '50', // ✅ String será convertida
      };

      const resultado = esquemaCriacaoPerfume.parse(dados);

      expect(resultado.preco).toBe(299.9);
      expect(typeof resultado.preco).toBe('number');
      expect(resultado.frasco).toBe(100);
      expect(resultado.quantidade_estoque).toBe(50);
    });

    it('deve REJEITAR preco com letras misturadas', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: '100abc', // ❌ LETRAS NO MEIO
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow();
    });

    it('deve REJEITAR frasco negativo', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: -50, // ❌ NEGATIVO
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow(
        'O volume deve ser maior que zero'
      );
    });

    it('deve REJEITAR frasco zero', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 0, // ❌ ZERO
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow(
        'O volume deve ser maior que zero'
      );
    });

    it('deve REJEITAR quantidade_estoque negativa', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
        quantidade_estoque: -10, // ❌ NEGATIVO
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow();
    });

    it('deve ACEITAR quantidade_estoque zero (padrão válido)', () => {
      const dados = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
        quantidade_estoque: 0, // ✅ ZERO É VÁLIDO
      };

      const resultado = esquemaCriacaoPerfume.parse(dados);
      expect(resultado.quantidade_estoque).toBe(0);
    });

    it('deve USAR 0 como padrão se quantidade_estoque não for enviada', () => {
      const dados = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
        // ✅ quantidade_estoque omitida
      };

      const resultado = esquemaCriacaoPerfume.parse(dados);
      expect(resultado.quantidade_estoque).toBe(0);
    });

    it('deve REJEITAR quantidade_estoque com decimal (não é inteiro)', () => {
      const dadosInvalidos = {
        nome: 'Perfume Teste',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
        quantidade_estoque: 10.5, // ❌ DECIMAL
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow();
    });
  });

  // ==========================================
  // PERFUME - Validações de Strings
  // ==========================================
  describe('esquemaCriacaoPerfume - Validação de Strings', () => {
    it('deve REJEITAR nome muito curto (<3 caracteres)', () => {
      const dadosInvalidos = {
        nome: 'AB', // ❌ APENAS 2
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow('Mínimo 3 caracteres');
    });

    it('deve REJEITAR nome muito longo (>100 caracteres)', () => {
      const dadosInvalidos = {
        nome: 'A'.repeat(101), // ❌ 101 CARACTERES
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow();
    });

    it('deve REMOVER espaços em branco (trim) do nome', () => {
      const dados = {
        nome: '  Perfume Teste  ', // ✅ ESPAÇOS SERÃO REMOVIDOS
        marca: '  Marca  ',
        preco: 100,
        descricao: '  Descrição válida com mais de dez caracteres  ',
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      const resultado = esquemaCriacaoPerfume.parse(dados);

      expect(resultado.nome).toBe('Perfume Teste');
      expect(resultado.marca).toBe('Marca');
      expect(resultado.descricao).toBe('Descrição válida com mais de dez caracteres');
    });

    it('deve REJEITAR descrição muito curta (<10 caracteres)', () => {
      const dadosInvalidos = {
        nome: 'Perfume',
        marca: 'Marca',
        preco: 100,
        descricao: 'Curta', // ❌ APENAS 5 CARACTERES
        frasco: 100,
        foto: 'https://foto.jpg',
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow('Mínimo 10 caracteres');
    });

    it('deve REJEITAR foto vazia', () => {
      const dadosInvalidos = {
        nome: 'Perfume',
        marca: 'Marca',
        preco: 100,
        descricao: 'Descrição válida com mais de dez caracteres',
        frasco: 100,
        foto: '', // ❌ VAZIA
      };

      expect(() => esquemaCriacaoPerfume.parse(dadosInvalidos)).toThrow('A foto é obrigatória');
    });
  });

  // ==========================================
  // ESTOQUE - Casos Críticos
  // ==========================================
  describe('esquemaEditarEstoque - Validação Crítica', () => {
    it('deve REJEITAR estoque negativo', () => {
      expect(() => esquemaEditarEstoque.parse({ quantidade_estoque: -5 })).toThrow();
    });

    it('deve ACEITAR estoque zero', () => {
      const resultado = esquemaEditarEstoque.parse({ quantidade_estoque: 0 });
      expect(resultado.quantidade_estoque).toBe(0);
    });

    it('deve USAR 0 como padrão se não enviado', () => {
      const resultado = esquemaEditarEstoque.parse({});
      expect(resultado.quantidade_estoque).toBe(0);
    });

    it('deve CONVERTER string para número', () => {
      const resultado = esquemaEditarEstoque.parse({ quantidade_estoque: '100' });
      expect(resultado.quantidade_estoque).toBe(100);
      expect(typeof resultado.quantidade_estoque).toBe('number');
    });

    it('deve REJEITAR decimal (apenas inteiros)', () => {
      expect(() => esquemaEditarEstoque.parse({ quantidade_estoque: 10.7 })).toThrow();
    });
  });

  // ==========================================
  // PAGINAÇÃO - Edge Cases Perigosos
  // ==========================================
  describe('esquemaListagemPerfumes - Paginação', () => {
    it('deve REJEITAR page negativa', () => {
      expect(() => esquemaListagemPerfumes.parse({ page: -1 })).toThrow(
        'Página deve ser maior que zero'
      );
    });

    it('deve REJEITAR page zero', () => {
      expect(() => esquemaListagemPerfumes.parse({ page: 0 })).toThrow(
        'Página deve ser maior que zero'
      );
    });

    it('deve REJEITAR page decimal', () => {
      expect(() => esquemaListagemPerfumes.parse({ page: 1.5 })).toThrow(
        'Página deve ser um número inteiro'
      );
    });

    it('deve USAR page=1 como padrão', () => {
      const resultado = esquemaListagemPerfumes.parse({});
      expect(resultado.page).toBe(1);
    });

    it('deve REJEITAR limit negativo', () => {
      expect(() => esquemaListagemPerfumes.parse({ limit: -10 })).toThrow(
        'Limite deve ser maior que zero'
      );
    });

    it('deve REJEITAR limit maior que 20', () => {
      expect(() => esquemaListagemPerfumes.parse({ limit: 21 })).toThrow(
        'Limite máximo é 100 itens por página'
      );
    });

    it('deve USAR limit=10 como padrão', () => {
      const resultado = esquemaListagemPerfumes.parse({});
      expect(resultado.limit).toBe(10);
    });

    it('deve CONVERTER strings para números na paginação', () => {
      const resultado = esquemaListagemPerfumes.parse({ page: '5', limit: '15' });

      expect(resultado.page).toBe(5);
      expect(resultado.limit).toBe(15);
      expect(typeof resultado.page).toBe('number');
      expect(typeof resultado.limit).toBe('number');
    });
  });

  // ==========================================
  // VENDEDOR - Validações Críticas
  // ==========================================
  describe('vendedorSchema - Validações Críticas', () => {
    it('deve REJEITAR email inválido', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'email-invalido', // ❌ SEM @
          senha: 'senha12345678',
          telefone: '31999999999',
          estado: 'MG',
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('Insira um e-mail válido');
    });

    it('deve REJEITAR senha muito curta (<8 caracteres)', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'joao@teste.com',
          senha: '1234567', // ❌ APENAS 7
          telefone: '31999999999',
          estado: 'MG',
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('A senha deve ter pelo menos 8 caracteres');
    });

    it('deve REJEITAR telefone com letras', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'joao@teste.com',
          senha: 'senha12345678',
          telefone: '319999abc99', // ❌ LETRAS
          estado: 'MG',
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('O telefone deve conter apenas números');
    });

    it('deve REJEITAR telefone com tamanho diferente de 11', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'joao@teste.com',
          senha: 'senha12345678',
          telefone: '3199999999', // ❌ APENAS 10 DÍGITOS
          estado: 'MG',
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('O telefone deve ter exatamente 11 números');
    });

    it('deve REJEITAR estado com mais de 2 letras', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'joao@teste.com',
          senha: 'senha12345678',
          telefone: '31999999999',
          estado: 'MGB', // ❌ 3 LETRAS
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('Use a sigla do estado com 2 letras');
    });

    it('deve CONVERTER estado para maiúsculo automaticamente', () => {
      const resultado = vendedorSchema.parse({
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'senha12345678',
        telefone: '31999999999',
        estado: 'mg', // ✅ MINÚSCULO SERÁ CONVERTIDO
        cidade: 'Salinas',
        nome_loja: 'Loja Teste',
      });

      expect(resultado.estado).toBe('MG');
    });

    it('deve REJEITAR estado com números', () => {
      expect(() =>
        vendedorSchema.parse({
          nome: 'João Silva',
          email: 'joao@teste.com',
          senha: 'senha12345678',
          telefone: '31999999999',
          estado: 'M1', // ❌ NÚMERO
          cidade: 'Salinas',
          nome_loja: 'Loja Teste',
        })
      ).toThrow('A sigla deve conter apenas letras');
    });
  });
});
