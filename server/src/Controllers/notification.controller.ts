import { NextFunction, Request, request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import { NotificaModel } from "../models/Notification.model";

export const getNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
     const notification = await NotificaModel.find().sort({createdAt: -1});
    } catch(err){
      next(new AppError("error in getNotification", 400))
  }
});
