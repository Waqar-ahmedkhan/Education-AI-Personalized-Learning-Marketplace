import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { AppError } from "./utils/AppError";
import { globalErrorHandler } from "./middlewares/GlobalErrorhandler";
import { connectRedis } from "./utils/RedisConnect";
import UserRoute from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRoute from "./routes/order.route";
import notificationRoute from "./routes/notification.route";
import AdminRoute from "./routes/admin.route";
import analyticsRouter from "./routes/analytics.route";

dotenv.config();

export const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(cors({ origin: process.env.ORIGIN_URL }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

//connectDbs
connectRedis();

app.use("/api/v1", UserRoute);
app.use("/api/v1", AdminRoute);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRoute);
app.use("/api/v1", notificationRoute);
app.use("/api/v1", analyticsRouter)
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
