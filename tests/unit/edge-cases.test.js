// tests/unit/edge-cases.test.js
import { describe, it, expect } from 'vitest';

describe('⚠️ Edge Cases Críticos - Lógica de Negócio', () => {

  // ==========================================
  // CÁLCULOS DE PAGINAÇÃO
  // ==========================================
  describe('Cálculo de Paginação', () => {

    // Função auxiliar que simula o cálculo do service
    const calcularPaginacao = (total, page, limit) => {
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      
      return {
        total,
        page,
        limit,
        totalPages,
        skip,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    };

    it('deve calcular corretamente para primeira página', () => {
      const resultado = calcularPaginacao(50, 1, 10);
      
      expect(resultado.totalPages).toBe(5);
      expect(resultado.skip).toBe(0);
      expect(resultado.hasNext).toBe(true);
      expect(resultado.hasPrev).toBe(false);
    });

    it('deve calcular corretamente para página do meio', () => {
      const resultado = calcularPaginacao(50, 3, 10);
      
      expect(resultado.totalPages).toBe(5);
      expect(resultado.skip).toBe(20);
      expect(resultado.hasNext).toBe(true);
      expect(resultado.hasPrev).toBe(true);
    });

    it('deve calcular corretamente para última página', () => {
      const resultado = calcularPaginacao(50, 5, 10);
      
      expect(resultado.totalPages).toBe(5);
      expect(resultado.skip).toBe(40);
      expect(resultado.hasNext).toBe(false);
      expect(resultado.hasPrev).toBe(true);
    });

    it('deve calcular corretamente quando total é menor que limit', () => {
      const resultado = calcularPaginacao(5, 1, 10);
      
      expect(resultado.totalPages).toBe(1);
      expect(resultado.skip).toBe(0);
      expect(resultado.hasNext).toBe(false);
      expect(resultado.hasPrev).toBe(false);
    });

    it('deve calcular corretamente quando há resto na divisão', () => {
      const resultado = calcularPaginacao(25, 1, 10);
      
      expect(resultado.totalPages).toBe(3); // 25 / 10 = 2.5 → ceil = 3
      expect(resultado.hasNext).toBe(true);
    });

    it('deve calcular skip correto para página muito alta', () => {
      const resultado = calcularPaginacao(1000, 50, 10);
      
      expect(resultado.skip).toBe(490); // (50 - 1) * 10
      expect(resultado.totalPages).toBe(100);
    });

    it('deve retornar 0 totalPages quando total é 0', () => {
      const resultado = calcularPaginacao(0, 1, 10);
      
      expect(resultado.totalPages).toBe(0);
      expect(resultado.hasNext).toBe(false);
      expect(resultado.hasPrev).toBe(false);
    });

    it('deve lidar com página maior que totalPages (banco retorna vazio)', () => {
      // Cenário: Usuário tenta acessar página 999, mas só existem 5 páginas
      const resultado = calcularPaginacao(50, 999, 10);
      
      expect(resultado.totalPages).toBe(5);
      expect(resultado.skip).toBe(9980); // Skip gigante = banco retorna []
      expect(resultado.hasNext).toBe(false);
      expect(resultado.hasPrev).toBe(true);
    });
  });

  // ==========================================
  // VALIDAÇÃO DE VALORES MONETÁRIOS
  // ==========================================
  describe('Valores Monetários - Preço e Estoque', () => {

    // Função auxiliar para validar preço
    const validarPreco = (preco) => {
      if (typeof preco !== 'number') throw new Error('Preço deve ser número');
      if (preco <= 0) throw new Error('Preço deve ser maior que zero');
      if (!Number.isFinite(preco)) throw new Error('Preço deve ser finito');
      return true;
    };

    it('deve aceitar preços válidos', () => {
      expect(validarPreco(0.01)).toBe(true);
      expect(validarPreco(299.90)).toBe(true);
      expect(validarPreco(1000000)).toBe(true);
    });

    it('deve rejeitar preço zero', () => {
      expect(() => validarPreco(0))
        .toThrow('Preço deve ser maior que zero');
    });

    it('deve rejeitar preço negativo', () => {
      expect(() => validarPreco(-100))
        .toThrow('Preço deve ser maior que zero');
    });

    it('deve rejeitar Infinity', () => {
      expect(() => validarPreco(Infinity))
        .toThrow('Preço deve ser finito');
    });

    it('deve rejeitar NaN', () => {
      expect(() => validarPreco(NaN))
        .toThrow('Preço deve ser finito');
    });

    it('deve rejeitar string (sem coerção automática)', () => {
      expect(() => validarPreco('299.90'))
        .toThrow('Preço deve ser número');
    });
  });

  // ==========================================
  // VALIDAÇÃO DE ESTOQUE
  // ==========================================
  describe('Validação de Estoque (Nunca Negativo)', () => {

    // Função auxiliar que simula atualização de estoque
    const atualizarEstoque = (estoqueAtual, quantidade) => {
      if (typeof quantidade !== 'number' || !Number.isInteger(quantidade)) {
        throw new Error('Quantidade deve ser inteiro');
      }
      
      const novoEstoque = estoqueAtual + quantidade;
      
      if (novoEstoque < 0) {
        throw new Error('Estoque não pode ficar negativo');
      }
      
      return novoEstoque;
    };

    it('deve adicionar estoque corretamente', () => {
      expect(atualizarEstoque(10, 5)).toBe(15);
      expect(atualizarEstoque(0, 100)).toBe(100);
    });

    it('deve subtrair estoque corretamente', () => {
      expect(atualizarEstoque(10, -5)).toBe(5);
      expect(atualizarEstoque(100, -100)).toBe(0);
    });

    it('deve BLOQUEAR subtração que deixaria estoque negativo', () => {
      expect(() => atualizarEstoque(10, -11))
        .toThrow('Estoque não pode ficar negativo');
      
      expect(() => atualizarEstoque(5, -20))
        .toThrow('Estoque não pode ficar negativo');
    });

    it('deve rejeitar quantidade decimal', () => {
      expect(() => atualizarEstoque(10, 5.5))
        .toThrow('Quantidade deve ser inteiro');
    });

    it('deve permitir estoque zero (válido)', () => {
      expect(atualizarEstoque(10, -10)).toBe(0);
    });
  });

  // ==========================================
  // VALIDAÇÃO DE DUPLICIDADE (Multi-tenancy)
  // ==========================================
  describe('Validação de Duplicidade de Nome (Multi-tenancy)', () => {

    // Simula o banco de dados
    const perfumesDB = [
      { id: 1, nome: 'Dior Sauvage', vendedorId: 1 },
      { id: 2, nome: 'Azzaro Pour Homme', vendedorId: 1 },
      { id: 3, nome: 'Dior Sauvage', vendedorId: 2 }, // ✅ Mesmo nome, vendedor diferente
    ];

    const verificarDuplicidade = (nome, vendedorId) => {
      return perfumesDB.some(
        p => p.nome.toLowerCase() === nome.toLowerCase() && p.vendedorId === vendedorId
      );
    };

    it('deve detectar nome duplicado para mesmo vendedor', () => {
      expect(verificarDuplicidade('Dior Sauvage', 1)).toBe(true);
      expect(verificarDuplicidade('Azzaro Pour Homme', 1)).toBe(true);
    });

    it('deve permitir mesmo nome para vendedores diferentes', () => {
      expect(verificarDuplicidade('Dior Sauvage', 2)).toBe(true); // Já existe
      expect(verificarDuplicidade('Dior Sauvage', 3)).toBe(false); // Vendedor 3 pode usar
    });

    it('deve ser case-insensitive', () => {
      expect(verificarDuplicidade('dior sauvage', 1)).toBe(true);
      expect(verificarDuplicidade('DIOR SAUVAGE', 1)).toBe(true);
      expect(verificarDuplicidade('DiOr SaUvAgE', 1)).toBe(true);
    });

    it('deve permitir nome novo para qualquer vendedor', () => {
      expect(verificarDuplicidade('Perfume Novo', 1)).toBe(false);
      expect(verificarDuplicidade('Perfume Novo', 2)).toBe(false);
    });
  });

  // ==========================================
  // CÁLCULO DE VALOR TOTAL DO PEDIDO
  // ==========================================
  describe('Cálculo de Valor Total do Pedido', () => {

    const calcularValorTotal = (itens) => {
      if (!Array.isArray(itens) || itens.length === 0) {
        throw new Error('Pedido deve ter pelo menos 1 item');
      }

      const total = itens.reduce((soma, item) => {
        if (item.quantidade <= 0) {
          throw new Error('Quantidade deve ser positiva');
        }
        if (item.preco_unitario <= 0) {
          throw new Error('Preço unitário deve ser positivo');
        }
        return soma + (item.quantidade * item.preco_unitario);
      }, 0);

      // Arredondar para 2 casas decimais (centavos)
      return Math.round(total * 100) / 100;
    };

    it('deve calcular valor total corretamente', () => {
      const itens = [
        { quantidade: 2, preco_unitario: 100.00 },
        { quantidade: 1, preco_unitario: 50.00 }
      ];

      expect(calcularValorTotal(itens)).toBe(250.00);
    });

    it('deve arredondar para 2 casas decimais', () => {
      const itens = [
        { quantidade: 3, preco_unitario: 33.33 } // 99.99
      ];

      expect(calcularValorTotal(itens)).toBe(99.99);
    });

    it('deve lidar com valores com muitas casas decimais', () => {
      const itens = [
        { quantidade: 1, preco_unitario: 10.555 },
        { quantidade: 2, preco_unitario: 20.777 }
      ];

      // 10.555 + 41.554 = 52.109 → arredonda para 52.11
      expect(calcularValorTotal(itens)).toBe(52.11);
    });

    it('deve rejeitar pedido vazio', () => {
      expect(() => calcularValorTotal([]))
        .toThrow('Pedido deve ter pelo menos 1 item');
    });

    it('deve rejeitar quantidade zero', () => {
      const itens = [
        { quantidade: 0, preco_unitario: 100 }
      ];

      expect(() => calcularValorTotal(itens))
        .toThrow('Quantidade deve ser positiva');
    });

    it('deve rejeitar quantidade negativa', () => {
      const itens = [
        { quantidade: -2, preco_unitario: 100 }
      ];

      expect(() => calcularValorTotal(itens))
        .toThrow('Quantidade deve ser positiva');
    });

    it('deve rejeitar preço unitário zero', () => {
      const itens = [
        { quantidade: 2, preco_unitario: 0 }
      ];

      expect(() => calcularValorTotal(itens))
        .toThrow('Preço unitário deve ser positivo');
    });
  });

  // ==========================================
  // BUSCA CASE-INSENSITIVE
  // ==========================================
  describe('Busca de Perfumes (Case-Insensitive)', () => {

    const perfumes = [
      { id: 1, nome: 'Dior Sauvage' },
      { id: 2, nome: 'Azzaro Pour Homme' },
      { id: 3, nome: 'Chanel Bleu' },
      { id: 4, nome: 'ARMANI CODE' }
    ];

    const buscarPerfume = (termo) => {
      if (!termo || termo.trim() === '') return perfumes;
      
      const termoLower = termo.toLowerCase();
      return perfumes.filter(p => 
        p.nome.toLowerCase().includes(termoLower)
      );
    };

    it('deve retornar todos se termo vazio', () => {
      expect(buscarPerfume('')).toHaveLength(4);
      expect(buscarPerfume('   ')).toHaveLength(4);
    });

    it('deve buscar case-insensitive', () => {
      expect(buscarPerfume('dior')).toHaveLength(1);
      expect(buscarPerfume('DIOR')).toHaveLength(1);
      expect(buscarPerfume('DiOr')).toHaveLength(1);
    });

    it('deve buscar por parte do nome', () => {
      expect(buscarPerfume('Azz')).toHaveLength(1);
      expect(buscarPerfume('Pour')).toHaveLength(1);
    });

    it('deve retornar vazio se não encontrar', () => {
      expect(buscarPerfume('XYZ')).toHaveLength(0);
    });

    it('deve buscar múltiplas palavras', () => {
      expect(buscarPerfume('Azzaro Pour')).toHaveLength(1);
    });
  });

  // ==========================================
  // VALIDAÇÃO DE FRASCO (ML)
  // ==========================================
  describe('Validação de Frasco (ML)', () => {

    const validarFrasco = (ml) => {
      if (typeof ml !== 'number') throw new Error('ML deve ser número');
      if (ml <= 0) throw new Error('ML deve ser maior que zero');
      if (!Number.isFinite(ml)) throw new Error('ML deve ser finito');
      
      // Validação de negócio: frascos comuns (30, 50, 100, 200ml)
      const tamanhosComuns = [30, 50, 75, 100, 125, 150, 200, 250];
      
      return {
        valido: true,
        ml,
        isComum: tamanhosComuns.includes(ml)
      };
    };

    it('deve aceitar tamanhos comuns', () => {
      expect(validarFrasco(100).isComum).toBe(true);
      expect(validarFrasco(50).isComum).toBe(true);
    });

    it('deve aceitar tamanhos personalizados', () => {
      const resultado = validarFrasco(85);
      expect(resultado.valido).toBe(true);
      expect(resultado.isComum).toBe(false);
    });

    it('deve rejeitar ML zero', () => {
      expect(() => validarFrasco(0))
        .toThrow('ML deve ser maior que zero');
    });

    it('deve rejeitar ML negativo', () => {
      expect(() => validarFrasco(-50))
        .toThrow('ML deve ser maior que zero');
    });

    it('deve rejeitar Infinity', () => {
      expect(() => validarFrasco(Infinity))
        .toThrow('ML deve ser finito');
    });
  });
});