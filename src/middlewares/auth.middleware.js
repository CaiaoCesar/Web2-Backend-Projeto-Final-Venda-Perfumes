export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Passamos o id do vendedor para que o Controller possa usar
    req.user = { id: decoded.id }; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};