import mongoose, {Schema, Document, Model} from "mongoose";


export interface IOrder extends Document  {
  userId: string;
  courseId: string;
  course_info: Object;
  
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  course_info: {
    type: Object,
    required: true
  }
}, {timestamps: true});

const OrderModel: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

