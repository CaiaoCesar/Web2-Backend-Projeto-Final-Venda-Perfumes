export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Ocorreu um erro interno no servidor.';

  // TRATAMENTO PARA ERROS DO MULTER (Ex: Arquivo muito grande)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'O arquivo é muito grande. O limite máximo é de 5MB.';
  }

  console.error('--- ERRO NO SISTEMA ---');
  console.error(`[${err.code || 'ERROR'}]: ${message}`);

  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
