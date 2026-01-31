import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔑 Auth Header:', authHeader); // Debug
  
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(' ')[1];
  console.log('🎫 Token extraído:', token); // Debug

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido. Vendedor ID:', decoded.id); // Debug
    req.user = { id: decoded.id, email: decoded.email }; 
    next();
  } catch (err) {
    console.error('❌ Erro ao verificar token:', err.message);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};