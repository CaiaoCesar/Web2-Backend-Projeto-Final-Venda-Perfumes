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
