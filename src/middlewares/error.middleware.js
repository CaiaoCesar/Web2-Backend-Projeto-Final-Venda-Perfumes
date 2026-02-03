// Função central para capturar e formatar todos os erros da API
export const errorHandler = (err, req, res, next) => {

  let statusCode = err.statusCode || 500;

  let message = err.message || 'Ocorreu um erro interno no servidor.';

  // Erro para tamanho de arquivo do upload
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'O arquivo é muito grande. O limite máximo é de 5MB.';
  }

  console.error('--- ERRO NO SISTEMA ---');
  console.error(`[${err.code || 'ERROR'}]: ${message}`);

  // Envio da resposta final formatada em JSON
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Inclusão de detalhes de validação (como erros do Zod) se existirem
    ...(err.errors && { errors: err.errors }),
    // Exibição do rastro do erro (stack trace) apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};