import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { AppError } from "./utils/AppError";
import { globalErrorHandler } from "./middlewares/GlobalErrorhandler";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // To parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded request bodies
app.use(cors()); // To allow cross-origin requests
app.use(cookieParser()); // To parse cookies

app.use((err: Error, req: Request, res: Response, next: () => void) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
  next();
});

// Sample route to test the server
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware

app.use(globalErrorHandler);


// Set up MongoDB connection

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
