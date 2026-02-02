export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode; // Aqui definimos se é 400, 401, etc.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
