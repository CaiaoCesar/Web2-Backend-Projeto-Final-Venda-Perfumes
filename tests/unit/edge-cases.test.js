
/* Nesse teste verficamos os casos mais criticos que não estavam
*  diretamente contidos nos testes de integração
*/

// O describe serve para agrupar testes relacionados
// O it é um teste unitário individual
// expect é usado para fazer verificações
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
        hasPrev: page > 1,
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
      expect(validarPreco(299.9)).toBe(true);
      expect(validarPreco(1000000)).toBe(true);
    });

    it('deve rejeitar preço zero', () => {
      expect(() => validarPreco(0)).toThrow('Preço deve ser maior que zero');
    });

    it('deve rejeitar preço negativo', () => {
      expect(() => validarPreco(-100)).toThrow('Preço deve ser maior que zero');
    });

    it('deve rejeitar Infinity', () => {
      expect(() => validarPreco(Infinity)).toThrow('Preço deve ser finito');
    });

    it('deve rejeitar NaN', () => {
      expect(() => validarPreco(NaN)).toThrow('Preço deve ser finito');
    });

    it('deve rejeitar string (sem coerção automática)', () => {
      expect(() => validarPreco('299.90')).toThrow('Preço deve ser número');
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
      expect(() => atualizarEstoque(10, -11)).toThrow('Estoque não pode ficar negativo');

      expect(() => atualizarEstoque(5, -20)).toThrow('Estoque não pode ficar negativo');
    });

    it('deve rejeitar quantidade decimal', () => {
      expect(() => atualizarEstoque(10, 5.5)).toThrow('Quantidade deve ser inteiro');
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
        (p) => p.nome.toLowerCase() === nome.toLowerCase() && p.vendedorId === vendedorId
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
        isComum: tamanhosComuns.includes(ml),
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
      expect(() => validarFrasco(0)).toThrow('ML deve ser maior que zero');
    });

    it('deve rejeitar ML negativo', () => {
      expect(() => validarFrasco(-50)).toThrow('ML deve ser maior que zero');
    });

    it('deve rejeitar Infinity', () => {
      expect(() => validarFrasco(Infinity)).toThrow('ML deve ser finito');
    });
  });

  // ==========================================
  // VALIDAÇÃO DE UNICIDADE DE LOJA (Simulação)
  // ==========================================
  describe('Validação de Unicidade de Loja (Lógica de Service)', () => {
    
    // Simula o banco de dados com lojas já existentes
    const bancoDeLojas = [
      'Perfumes Salinas',
      'O Boticário',
      'Natura Store',
      '  Loja Com Espaço  ' // Simula um erro de cadastro antigo
    ];

    // Função que simula a lógica do Service (Service Layer)
    const verificarDisponibilidadeLoja = (nomeLoja) => {
      if (!nomeLoja) return false;

      // Normaliza para comparar (remove espaços e põe em minúsculo)
      const nomeNormalizado = nomeLoja.trim().toLowerCase();

      // Procura no "banco"
      const existe = bancoDeLojas.some(loja => 
        loja.trim().toLowerCase() === nomeNormalizado
      );

      if (existe) {
        throw new Error('O nome da loja já está em uso');
      }

      return true; // Disponível
    };

    it('deve REJEITAR nome de loja exatamente igual', () => {
      expect(() => verificarDisponibilidadeLoja('Perfumes Salinas')).toThrow('já está em uso');
    });

    it('deve REJEITAR nome de loja com diferença de maiúscula/minúscula (Case Insensitive)', () => {
      expect(() => verificarDisponibilidadeLoja('perfumes salinas')).toThrow('já está em uso');
      expect(() => verificarDisponibilidadeLoja('PERFUMES SALINAS')).toThrow('já está em uso');
    });

    it('deve REJEITAR nome de loja com espaços extras', () => {
      expect(() => verificarDisponibilidadeLoja('  Perfumes Salinas  ')).toThrow('já está em uso');
    });

    it('deve ACEITAR um nome de loja novo', () => {
      expect(verificarDisponibilidadeLoja('Loja Nova do Matheus')).toBe(true);
    });

    it('deve ACEITAR nome parecido, mas diferente', () => {
      // "Perfumes Salinas" existe, mas "Perfumes Salinas II" não
      expect(verificarDisponibilidadeLoja('Perfumes Salinas II')).toBe(true);
    });
  });  
});
