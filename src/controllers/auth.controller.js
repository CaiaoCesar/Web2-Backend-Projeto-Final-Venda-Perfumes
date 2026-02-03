import * as authService from '../services/auth.service.js';

/**
 * Controller de Autenticação
 * Responsável por gerenciar requisições HTTP relacionadas aos vendedores
 * Delegar toda a regra de negócio complexa para o Service
 */

/**
 * Registra um novo vendedor no sistema
 * POST /api/v2/vendedores
 */

export const registrarVendedor = async (req, res, next) => {
  try {
    //Irá delegar a lógica de criação para o service, basicamente o que vai tratar hash de senha, validações, etc
    const novoVendedor = await authService.criarVendedor(req.body);

    // Retorna o sucesso 201 (Created) e os dados do vendedor criado (sem a senha)
    res.status(201).json({
      success: true,
      message: 'Vendedor registrado com sucesso!',
      data: novoVendedor,
    });
  } catch (error) {
    // Encaminha qualquer erro para o Middleware de Erro Global
    next(error);
  }
};

/**
 * Realiza o login e gera o token de acesso.
 * Método: POST /api/v2/login
 */

export const loginVendedor = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Solicita ao service que verifique as credenciais e gere o token JWT
    const { vendedor, token } = await authService.autenticarVendedor(email, senha);
    console.log('Este é o token', token);

    // Retornará o token para o cliente e o frontend deve salvar esse token para enviar no header 'Authorization' das próximas requisições
    return res.json({
      success: true,
      data: { vendedor, token },
    });
  } catch (error) {
    // Encaminha qualquer erro para o Middleware de Erro Global
    next(error);
  }
};

export default {
  registrarVendedor,
  loginVendedor,
};
