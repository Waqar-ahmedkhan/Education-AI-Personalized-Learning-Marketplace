import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

// Global Error Handling Middleware
export const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.error("Error: ", err);

  // Send a response based on the type of error
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Internal Server Error",
    // Include the stack trace only in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};


