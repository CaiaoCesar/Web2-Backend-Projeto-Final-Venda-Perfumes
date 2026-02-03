import { describe, it, expect } from 'vitest';
import {
  formatarTelefone,
  gerarMensagemDoCarrinho,
  gerarLinkWhatsApp,
} from '../../src/services/checkout.service.js';

describe('Checkout Service', () => {
  describe('formatarTelefone', () => {
    it('deve adicionar o prefixo 55 para números de celular com 11 dígitos (com DDD)', () => {
      // Ex: (11) 91234-5678 -> 11 dígitos limpos
      const input = '(11) 91234-5678';
      const output = formatarTelefone(input);
      expect(output).toBe('5511912345678');
    });

    it('deve adicionar o prefixo 55 para números fixos com 10 dígitos (com DDD)', () => {
      // Ex: (31) 3333-4444 -> 10 dígitos limpos
      const input = '(31) 3333-4444';
      const output = formatarTelefone(input);
      expect(output).toBe('553133334444');
    });

    it('deve retornar apenas os dígitos se o comprimento não for 10 nem 11', () => {
      // Ex: Número incompleto ou já formatado incorretamente pelo usuário
      const inputCurto = '123';
      expect(formatarTelefone(inputCurto)).toBe('123');

      // Ex: Número que já possui DDI ou é muito longo
      const inputLongo = '5511999998888'; // 13 dígitos
      expect(formatarTelefone(inputLongo)).toBe('5511999998888');
    });

    it('deve limpar caracteres não numéricos antes de verificar o tamanho', () => {
      const inputSujo = '++(11) 9-8888.7777 abcd'; // Apenas 11 números reais
      const output = formatarTelefone(inputSujo);
      expect(output).toBe('5511988887777');
    });
  });

  describe('gerarMensagemDoCarrinho', () => {
    it('deve gerar a mensagem corretamente com nome, itens e total formatado', () => {
      const dados = {
        nomeCliente: 'Maria',
        items: [
          { nome: 'Malbec', quantidade: 2, preco: 150.5 },
          { nome: 'Milion', quantidade: 1, preco: 200.0 },
        ],
        valorTotal: 501.0,
      };

      const resultado = gerarMensagemDoCarrinho(dados);

      expect(resultado).toContain('Olá, meu nome é Maria');
      expect(resultado).toContain('2x Malbec - R$ 150.50');
      expect(resultado).toContain('1x Milion - R$ 200.00');
      expect(resultado).toContain('Total: R$ 501.00');
    });

    it('deve lidar com itens faltando nome ou preço (valores padrão)', () => {
      const dados = {
        nomeCliente: 'João',
        items: [
          // Item sem nome e sem preço numérico
          { quantidade: 3, preco: null },
        ],
        valorTotal: 0,
      };

      const resultado = gerarMensagemDoCarrinho(dados);

      expect(resultado).toContain('3x Produto');
      expect(resultado).toContain('R$ 0.00');
    });

    it('deve assumir quantidade 1 se não informada', () => {
      const dados = {
        nomeCliente: 'Teste',
        items: [{ nome: 'Item Único', preco: 50 }],
        valorTotal: 50,
      };

      const resultado = gerarMensagemDoCarrinho(dados);
      expect(resultado).toContain('1x Item Único');
    });
  });

  describe('gerarLinkWhatsApp', () => {
    it('deve gerar a URL correta com o telefone e a mensagem codificada (URL Encoded)', () => {
      const input = {
        telefoneFormatado: '5511999999999',
        mensagem: 'Olá, gostaria de pedir.',
      };

      const resultado = gerarLinkWhatsApp(input);

      // Verifica estrutura básica
      expect(resultado).toMatch(/^https:\/\/wa\.me\/5511999999999/);
      
      // Verifica se a mensagem foi codificada (espaços viram + ou %20, acentos codificados)
      // URLSearchParams geralmente usa '+' para espaços em query strings
      expect(resultado).toContain('text=Ol%C3%A1%2C+gostaria+de+pedir.');
    });

    it('deve funcionar corretamente com caracteres especiais', () => {
      const input = {
        telefoneFormatado: '550012341234',
        mensagem: 'Sensação @ R$ 10,00',
      };

      const resultado = gerarLinkWhatsApp(input);
      
      // Sensação -> Sensa%C3%A7%C3%A3o
      // @ -> %40
      // Espaço -> +
      expect(resultado).toContain('Sensa%C3%A7%C3%A3o+%40+R%24+10%2C00');
    });
  });
});