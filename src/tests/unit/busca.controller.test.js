import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buscarPerfumes } from '../../controllers/busca.controller.js';
import * as buscaService from '../../services/busca.service.js';
import * as buscaSchema from '../../schemas/busca.schema.js';

// Mock do Service
vi.mock('../../services/busca.service.js');

// Mock do Schema (para isolamento do controller)
vi.mock('../../schemas/busca.schema.js', () => ({
  esquemaListagemPerfumes: {
    parse: vi.fn() // Mock da função .parse() do Zod
  }
}));

describe('Unit: Busca Controller', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn(); // Mock do next
  });

  it('Deve retornar 200 e os dados quando a busca é válida', async () => {
    const filtrosMock = { termo: 'Teste', pagina: 1 };
    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue(filtrosMock);

    const resultadoServico = { produtos: [], paginacao: {} };
    buscaService.buscarPerfumes.mockResolvedValue(resultadoServico);

    req.query = { termo: 'Teste', pagina: '1' };

    await buscarPerfumes(req, res, next);

    expect(buscaSchema.esquemaListagemPerfumes.parse).toHaveBeenCalledWith(req.query);
    expect(buscaService.buscarPerfumes).toHaveBeenCalledWith(filtrosMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'sucesso',
      dados: resultadoServico
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Deve chamar next(error) se a validação do schema falhar', async () => {
    const erroValidacao = new Error('ZodError');
    buscaSchema.esquemaListagemPerfumes.parse.mockImplementation(() => {
      throw erroValidacao;
    });

    await buscarPerfumes(req, res, next);

    expect(buscaService.buscarPerfumes).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(erroValidacao);
  });

  it('Deve chamar next(error) se o serviço falhar', async () => {
    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue({});

    const erroServico = new Error('Erro de Conexão');
    buscaService.buscarPerfumes.mockRejectedValue(erroServico);

    await buscarPerfumes(req, res, next);

    expect(next).toHaveBeenCalledWith(erroServico);
  });

  it('Deve lidar corretamente com uma busca que não retorna resultados (lista vazia)', async () => {
    const filtrosMock = { termo: 'inexistente' };
    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue(filtrosMock);

    const resultadoVazio = { produtos: [], paginacao: { total: 0, pagina: 1 } };
    buscaService.buscarPerfumes.mockResolvedValue(resultadoVazio);

    req.query = { termo: 'inexistente' };

    await buscarPerfumes(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'sucesso',
      dados: resultadoVazio
    });
  });

  it('Deve garantir que apenas os dados sanitizados pelo Schema sejam passados ao Serviço', async () => {
    const inputSujo = { termo: 'Teste', campoMalicioso: 'delete * from users' };
    const outputLimpo = { termo: 'Teste' };

    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue(outputLimpo);
    buscaService.buscarPerfumes.mockResolvedValue({});

    req.query = inputSujo;

    await buscarPerfumes(req, res, next);

    expect(buscaService.buscarPerfumes).toHaveBeenCalledWith(outputLimpo);
    expect(buscaService.buscarPerfumes).not.toHaveBeenCalledWith(expect.objectContaining({ campoMalicioso: expect.anything() }));
  });

  it('Deve respeitar a transformação de tipos feita pelo Schema antes de chamar o Serviço', async () => {
    req.query = { pagina: '5', limite: '20' };
    
    const filtrosTipados = { pagina: 5, limite: 20 };
    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue(filtrosTipados);
    buscaService.buscarPerfumes.mockResolvedValue({});

    await buscarPerfumes(req, res, next);

    expect(buscaService.buscarPerfumes).toHaveBeenCalledWith({
      pagina: 5,
      limite: 20
    });
  });

  it('Deve chamar o Schema com query vazia se req.query for undefined', async () => {
    // Cenário de robustez: Express falhou ou request veio estranho sem query string
    req.query = undefined;
    
    buscaSchema.esquemaListagemPerfumes.parse.mockReturnValue({});
    buscaService.buscarPerfumes.mockResolvedValue({});

    await buscarPerfumes(req, res, next);

    expect(buscaSchema.esquemaListagemPerfumes.parse).toHaveBeenCalledWith(undefined);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});