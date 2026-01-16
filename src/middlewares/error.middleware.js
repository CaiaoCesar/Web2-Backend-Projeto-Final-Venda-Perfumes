export const errorHandler = (err, req, res, next) => {
 
  console.error('--- ERRO NO SISTEMA ---');
  console.error(err.stack);

  // Definimos um status padrão (500) se não houver um definido no erro
  const statusCode = err.statusCode || 500;
  
  // Mensagem amigável para o usuário
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  // Resposta padronizada (Requisito: Tratamento de Erros)
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
};