"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    /**
     * Constructs an AppError instance.
     * @param message - The error message.
     * @param statusCode - The HTTP status code (4xx or 5xx).
     * @param additionalProperties - Optional additional error information.
     */
    constructor(message, statusCode, additionalProperties) {
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
exports.AppError = AppError;
