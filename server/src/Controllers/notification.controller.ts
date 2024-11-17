import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import { NotificaModel } from "../models/Notification.model";
import cron from "node-cron";

export const getNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificaModel.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (err) {
      next(new AppError("error in getNotification", 400));
    }
  }
);
/// update notification status

export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificaModel.findById(req.params.id);
      if (!notification) {
        next(new AppError("no notification found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification.status;
        await notification.save();
      }

      const notificaitons = await NotificaModel.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        message: "working update notificaiton",
        notificaitons,
      });
    } catch (err) {
      next(new AppError("error in update notification", 400));
    }
  }
);

cron.schedule("0 0 0 * * *", async () => {
  try {
    // Calculate the date 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Delete notifications with 'read' status that were created more than 3 days ago
    const result = await NotificaModel.deleteMany({
      status: "read",
      createdAt: { $lt: threeDaysAgo }, // Corrected operator here
    });

    console.log(`Cron Job: Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error("Error running cron job for cleaning notifications:", error);
  }
});
