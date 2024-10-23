export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public path?: string;
  public value?: any;
  public keyValue?: any;
  public errors?: any;
  public code?: number;

  /**
   * Constructs an AppError instance.
   * @param message - The error message.
   * @param statusCode - The HTTP status code (4xx or 5xx).
   * @param additionalProperties - Optional additional error information.
   */
  constructor(
    message: string,
    statusCode: number,
    additionalProperties?: {
      path?: string;
      value?: any;
      keyValue?: any;
      errors?: any;
      code?: number;
    }
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);

    if (additionalProperties) {
      this.path = additionalProperties.path;
      this.value = additionalProperties.value;
      this.keyValue = additionalProperties.keyValue;
      this.errors = additionalProperties.errors;
      this.code = additionalProperties.code;
    }
  }
}
