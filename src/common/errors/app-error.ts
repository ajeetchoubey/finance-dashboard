export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: unknown[];

  constructor(statusCode: number, message: string, errorCode = "APP_ERROR", details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = "AppError";
  }
}
