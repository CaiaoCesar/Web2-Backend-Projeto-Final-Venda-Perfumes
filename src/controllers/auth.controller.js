import * as authService from '../services/auth.service.js';

/**
 * Controller de autentificação de vendedores
 * Responsável por gerenciar requisições HTTP relacionadas aos vendedores
 * Delega a lógica de negócio para o authService
 */

/**
 * POST /api/v2/vendedores
 * Cria um novo vendedor
 */
export const registrarVendedor = async (req, res, next) => {
  try {
    const novoVendedor = await authService.criarVendedor(req.body);
    res.status(201).json({
      success: true,
      message: 'Vendedor registrado com sucesso!',
      data: novoVendedor,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN DE VENDEDOR
export const loginVendedor = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Chama o service
    const { vendedor, token } = await authService.autenticarVendedor(email, senha);

    console.log('Este é o token', token);
    return res.json({
      success: true,
      data: { vendedor, token },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registrarVendedor,
  loginVendedor,
};
