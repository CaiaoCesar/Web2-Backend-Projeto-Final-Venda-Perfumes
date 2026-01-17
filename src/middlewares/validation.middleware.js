import { esquemaCriacaoPerfume, esquemaEditarPerfume, esquemaEditarEstoque } from '../schemas/perfume.schema.js';

export const validarCriacaoProduto = (req, res, next) => {
  const result = esquemaCriacaoPerfume.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dados de cadastro inválidos",
      // O flatten() organiza os erros por campo (nome, preco, etc)
      errors: result.error.flatten().fieldErrors 
    });
  }
  
  req.body = result.data; // Garante que o Controller receba apenas o que o Zod validou
  next();
};

export const validarEditarProduto = (req, res, next) => {
  const result = esquemaEditarPerfume.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  next();
};

export const validarEditarEstoque = (req, res, next) => {
  const result = esquemaEditarEstoque.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  next();
};