import { AppError } from '../utils/AppError.js';
import {
  esquemaCriacaoPerfume,
  esquemaEditarPerfume,
  esquemaEditarEstoque,
  esquemaListagemPerfumes,
} from '../schemas/perfume.schema.js';

/**
 * Middleware genérico para validação de esquemas Zod (Body)
 */
export const validacao = (schema) => async (req, res, next) => {
  try {
    const dadosValidados = await schema.parseAsync(req.body);
    req.body = dadosValidados;
    next();
  } catch (error) {
    // Criamos o erro e anexamos os detalhes do Zod para o errorHandler ler
    const appError = new AppError('Dados de entrada inválidos', 400);
    appError.errors = error.errors.map((err) => ({
      campo: err.path[0],
      mensagem: err.message,
    }));
    next(appError);
  }
};

/**
 * Validação específica para criação com injeção de foto
 */
export const validarCriacaoProduto = (req, res, next) => {
  if (req.file && !req.body.foto) {
    req.body.foto = req.file.originalname;
  }

  const result = esquemaCriacaoPerfume.safeParse(req.body);

  if (!result.success) {
    const appError = new AppError('Dados de cadastro inválidos', 400);
    appError.errors = result.error.flatten().fieldErrors;
    return next(appError); // Envia para o errorHandler
  }

  req.body = result.data;
  next();
};

/**
 * Validação para edição de produto
 */
export const validarEditarProduto = (req, res, next) => {
  const result = esquemaEditarPerfume.safeParse(req.body);

  if (!result.success) {
    const appError = new AppError('Dados de edição inválidos', 400);
    appError.errors = result.error.flatten().fieldErrors;
    return next(appError);
  }

  req.body = result.data;
  next();
};

/**
 * Validação para edição de estoque
 */
export const validarEditarEstoque = (req, res, next) => {
  const result = esquemaEditarEstoque.safeParse(req.body);

  if (!result.success) {
    const appError = new AppError('Dados de estoque inválidos', 400);
    appError.errors = result.error.flatten().fieldErrors;
    return next(appError);
  }

  req.body = result.data;
  next();
};

/**
 * Validação de ID de parâmetro
 */
export const validarId = (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    const appError = new AppError('ID inválido', 400);
    appError.errors = { id: ['O ID deve ser um número inteiro positivo'] };
    return next(appError);
  }

  next();
};

/**
 * Validação de parâmetros de busca (Query Params)
 */
export const validarListagemPerfumes = (req, res, next) => {
  const result = esquemaListagemPerfumes.safeParse(req.query);

  if (!result.success) {
    const appError = new AppError('Parâmetros de busca inválidos', 400);
    appError.errors = result.error.flatten().fieldErrors;
    return next(appError);
  }

  req.query = result.data;
  next();
};
