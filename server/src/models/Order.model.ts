import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  courseId: string;
  payment_info: Object;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    payment_info: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrder> = mongoose.model<IOrder>(
  "OrderModel",
  orderSchema
);
