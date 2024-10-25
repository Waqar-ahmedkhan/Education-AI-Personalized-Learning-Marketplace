"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.globalErrorHandler = exports.AppError = void 0;
// Custom Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Helper function to send error in development mode
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
// Helper function to send error in production mode
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        return;
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
    });
};
// Handle Mongoose CastError
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
// Handle Mongoose Validation Error
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
// Handle Mongoose Duplicate Fields
const handleDuplicateFieldsDB = (err) => {
    const value = Object.values(err.keyValue).join(', ');
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
// Handle JWT Error
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
};
// Handle JWT Expired Error
const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401);
};
// Global Error Handler Middleware
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = Object.assign({}, err);
        error.message = err.message;
        // Handle different types of errors
        if (err.name === 'CastError')
            error = handleCastErrorDB(err);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(err);
        if (err.code === 11000)
            error = handleDuplicateFieldsDB(err);
        if (err.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (err.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
// Async Error Handler Wrapper
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
