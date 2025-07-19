import { Response, NextFunction } from 'express';
import { OrderModel, IOrder } from '../models/Order.model';
import { AppError } from '../utils/AppError';

export const newOrder = async (
  data: {
    userId: string;
    courseId: string;
    payment_info: { id: string; status: string };
  },
  res: Response,
  next: NextFunction
): Promise<IOrder | undefined> => {
  try {
    const order = await OrderModel.create(data);
    return order;
  } catch (error: any) {
    next(new AppError(error.message, 500));
    return undefined;
  }
};

export const getAllOrdersService = async (
  res: Response
): Promise<void> => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};