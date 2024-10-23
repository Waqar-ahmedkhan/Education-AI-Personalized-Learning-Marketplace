"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
// Helper function to send error in development mode
const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
// Helper function to send error in production mode
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming or other unknown errors: don't leak details
    console.error("ERROR 💥", err);
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
    });
};
// Custom error handler for different cases
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // CastError: Mongoose bad ObjectId
    if (err.name === "CastError") {
        err = new AppError_1.AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    // ValidationError: Mongoose validation error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        err = new AppError_1.AppError(`Invalid input data. ${errors.join(". ")}`, 400);
    }
    // Duplicate fields error from MongoDB
    if (err.code && err.code === 11000) {
        const value = Object.values(err.keyValue).join(", ");
        err = new AppError_1.AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        err = new AppError_1.AppError("Invalid token. Please log in again!", 401);
    }
    if (err.name === "TokenExpiredError") {
        err = new AppError_1.AppError("Your token has expired! Please log in again.", 401);
    }
    res.status(err.statusCode).json({
        status: err.status,
        success: false,
        message: err.message,
        stack: err.stack,
    });
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else {
        sendErrorProd(err, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
