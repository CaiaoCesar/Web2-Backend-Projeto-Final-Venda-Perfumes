import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

/**
 * Middleware de Autenticação.
 * Intercepta a requisição para garantir que o usuário possua um token JWT válido antes de acessar as rotas protegidas
 */

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Irá verificar se o token ele foi realmente enviado no cabeçalho
  if (!authHeader) {
    return next(new AppError('Token não fornecido', 401));
  }

  // Faz a validação se o formato é realmente "Bearer <token>"
  const partes = authHeader.split(' ');
  if (partes.length !== 2) {
    return next(new AppError('Token malformado', 401));
  }

  const token = partes[1];

  try {
    // Faz a verificação da validade e integridade do token (assinatura e a expiração)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Irá injetar os dados do usuário na requisição em questão 
    // Permite que os controllers saibam quem é usuário que está logado
    req.user = { id: decoded.id, email: decoded.email };

    next(); // Sucesso: irá seguir para o próximo middleware ou controller
  } catch (err) {
    // Padroniza o retorno do erro 401 para tokens expirados ou inválidos
    next(new AppError('Token inválido ou expirado', 401));
  }
};
