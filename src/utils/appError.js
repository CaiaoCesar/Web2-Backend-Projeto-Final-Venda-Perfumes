// Extensão da classe nativa Error para criação de erros personalizados no sistema
export class AppError extends Error {
  // Inicialização da classe com a mensagem de erro e o código de status HTTP (400, 401, etc.)
  constructor(message, statusCode) {
    // Chamada ao construtor da classe pai (Error) para processar a mensagem
    super(message);
    
    // Definição do código de status para identificação do tipo de erro
    this.statusCode = statusCode; 
    
    // Marcação do erro como operacional para diferenciação de falhas críticas
    this.isOperational = true;
    
    // Captura do rastro de execução para facilitar a depuração no terminal
    Error.captureStackTrace(this, this.constructor);
  }
}
