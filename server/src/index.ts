import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { AppError } from "./utils/AppError";
import { globalErrorHandler } from "./middlewares/GlobalErrorhandler";
import connectDB from "./utils/dbConnect";
import { connectRedis } from "./utils/RedisConnect";
import  UserRoute  from "./routes/user.route"

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.ORIGIN_URL }));
app.use(cookieParser());

//connectDbs
connectDB();
connectRedis();


app.use("/api/v1", UserRoute)
app.use((err: Error, req: Request, res: Response, next: () => void) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
  next();
});

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API!",
    data: {
      name: "API Server",
      version: "1.0.0",
    },
  });
  res.send("Server is running!");
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
