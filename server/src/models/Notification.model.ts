import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  courseId: string;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

export const NotificaModel: Model<INotification> =
  mongoose.model<INotification>("NotificationModel", notificationSchema);
