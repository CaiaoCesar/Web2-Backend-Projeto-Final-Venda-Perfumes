import { esquemaCriacaoPerfume, esquemaEditarPerfume, esquemaEditarEstoque, esquemaListagemPerfumes } from '../schemas/perfume.schema.js';

/**
 * Middleware para validação de esquemas Zod
 * @param {z.ZodObject} schema 
 */
export const validacao = (schema) => async (req, res, next) => {
  try {

    const dadosValidados = await schema.parseAsync(req.body);
    req.body = dadosValidados; 

    // Se passar na validação e transformação, segue para o Controller
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.errors.map((err) => ({
        campo: err.path[0],
        mensagem: err.message,
      })),
    });
  }
};

export const validarCriacaoProduto = (req, res, next) => {
  // Pega o nome do arquivo da foto e insere dentro do campo foto
  // Sem ele o zod não identifica que uma foto foi enviada
  if (req.file && !req.body.foto) {
    req.body.foto = req.file.originalname; 
  }

  // Confere os dados de entrada com as regras do zod
  const result = esquemaCriacaoPerfume.safeParse(req.body);
  
  // Se nã foi enviado algum dado ou estiver no formato errado é disparado um erro
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Dados de cadastro inválidos",
      errors: result.error.flatten().fieldErrors 
    });
  }
  
  // Se tudo estiver OK, substitui os dados padrão pelos dados validados pelo zod
  req.body = result.data; 
  next();
};

// Verifica os dados para editar o produto
export const validarEditarProduto = (req, res, next) => {
  const result = esquemaEditarPerfume.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      success: false, 
      message: "Dados de edição inválidos",
      errors: result.error.flatten().fieldErrors 
    });
  }
  req.body = result.data;
  next();
};

// Verifica os dados para editar estoque
export const validarEditarEstoque = (req, res, next) => {
  const result = esquemaEditarEstoque.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      success: false, 
      message: "Dados de estoque inválidos",
      errors: result.error.flatten().fieldErrors 
    });
  }
  req.body = result.data;
  next();
};

// Verifica se o ID é um número
export const validarId = (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "ID inválido",
      errors: { id: ["O ID deve ser um número inteiro positivo"] }
    });
  }
  next();
};

export const validarListagemPerfumes = (req, res, next) => {
  const result = esquemaListagemPerfumes.safeParse(req.query);
  
  if (!result.success) {
    return res.status(400).json({ 
      success: false, 
      message: "Parâmetros de busca inválidos",
      errors: result.error.flatten().fieldErrors 
    });
  }
  
  // Substitui os query params pelos dados validados e transformados
  req.query = result.data;
  next();
};