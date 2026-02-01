export const errorHandler = (err, req, res, next) => {
  // Log detalhado no terminal para o desenvolvedor
  console.error('--- ERRO NO SISTEMA ---');
  console.error(`[Status ${err.statusCode || 500}]: ${err.message}`);
  if (err.stack) console.error(err.stack);

  // Define o status e mensagem (com os padrões de segurança)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  // Resposta padronizada enviada ao cliente (Swagger/App)
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // ADICIONADO: Se houver detalhes de campos (Zod), eles aparecem aqui
    ...(err.errors && { errors: err.errors }),
    // Mostra o stack trace apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};