// Extensão da classe nativa Error para criação de erros personalizados no sistema
export class AppError extends Error {
  // Inicialização da classe com a mensagem de erro e o código de status HTTP (400, 401, etc.)
  constructor(message, statusCode) {
    super(message);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    
    this.statusCode = statusCode; 
    
    // Marcação do erro como operacional para diferenciar de falhas críticas de programação
=======
    this.statusCode = statusCode; // Aqui é definido se o codigo de status é 400, 404, etc.
>>>>>>> Stashed changes
=======
    this.statusCode = statusCode; // Aqui é definido se o codigo de status é 400, 404, etc.
>>>>>>> Stashed changes
    this.isOperational = true;
    
    // Captura do rastro de execução para facilitar a depuração no terminal
    Error.captureStackTrace(this, this.constructor);
  }
}