import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js'; // Importação da sua classe padronizada

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(new AppError("Token não fornecido", 401));
  }

  // Verifica se o formato é "Bearer <token>"
  const partes = authHeader.split(' ');
  if (partes.length !== 2) {
    return next(new AppError("Token malformado", 401));
  }

  const token = partes[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Anexa os dados decodificados para uso nos controllers seguintes
    req.user = { id: decoded.id, email: decoded.email }; 
    
    // Sucesso: segue para o próximo middleware ou controller
    next(); 
  } catch (err) {
    // Padroniza a resposta para tokens expirados ou inválidos
    next(new AppError("Token inválido ou expirado", 401));
  }
};