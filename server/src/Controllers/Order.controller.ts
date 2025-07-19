import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import UserModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/Course.model";
import { getAllOrdersService } from "../services/order.services";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import { OrderModel } from "../models/Order.model";
import { client } from "../utils/RedisConnect";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || typeof stripeSecretKey !== "string") {
  throw new Error("STRIPE_SECRET_KEY is not configured or is invalid");
}
const stripe = new Stripe(stripeSecretKey);

// Interfaces (existing ones remain unchanged)
interface CreateCheckoutSessionRequest {
  courseId: string;
}

interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string | null;
  message?: string;
}

interface VerifyPaymentRequest {
  session_id: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  user?: any; // Include updated user data
}

interface StripeSessionMetadata {
  userId: string;
  courseId: string;
  orderNumber: string;
  [key: string]: string;
}

interface GetAllOrdersResponse {
  success: boolean;
  orders?: any[];
  message?: string;
}

interface SendStripePublishableKeyResponse {
  success: boolean;
  publishableKey?: string;
  message?: string;
}

// Existing Functions (unchanged)
export const createCheckoutSession = CatchAsyncError(
  async (
    req: Request<{}, {}, CreateCheckoutSessionRequest>,
    res: Response<CreateCheckoutSessionResponse>,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.body;
      if (!courseId) {
        return next(new AppError("Course ID is required", 400));
      }

      const user = await UserModel.findById(req.user?._id);
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      const course: ICourse | null = await CourseModel.findById(courseId);
      if (!course) {
        return next(new AppError("Course not found", 404));
      }

      const courseExistInUser = user.courses.some(
        (c: { courseId: string }) => c.courseId.toString() === courseId
      );
      if (courseExistInUser) {
        return next(new AppError("You have already purchased this course", 400));
      }

      const orderNumber = uuidv4().slice(0, 8);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.name,
                description: course.description || "No description available",
              },
              unit_amount: Math.round(course.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}&orderNumber=${orderNumber}`,
        cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}`,
        metadata: {
          userId: user._id.toString(),
          courseId,
          orderNumber,
        },
      });

      res.status(200).json({
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
      });
    } catch (error: any) {
      return next(new AppError(error.message || "Internal server error", 500));
    }
  }
);

export const verifyPayment = CatchAsyncError(
  async (req: Request, res: Response<VerifyPaymentResponse>, next: NextFunction) => {
    try {
      const { session_id } = req.query;

      if (!session_id || typeof session_id !== "string") {
        return next(new AppError("Session ID is required", 400));
      }

      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status !== "paid") {
        return next(new AppError("Payment not completed", 400));
      }

      const { userId, courseId } = session.metadata as { [key: string]: string };
      const user = await UserModel.findById(userId).select("+courses");
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      if (!user.courses.some((c: { courseId: string }) => c.courseId === courseId)) {
        user.courses.push({ courseId });
        await user.save();
      }

      const paymentInfo = {
        id: session.id,
        status: session.payment_status,
        amount_paid: session.amount_total,
        currency: session.currency,
      };
      const order = new OrderModel({
        userId,
        courseId,
        payment_info: paymentInfo,
      });
      await order.save();

      res.status(200).json({ success: true, user: user.toJSON() });
    } catch (error: any) {
      return next(new AppError(error.message || "Internal server error", 500));
    }
  }
);

export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response<GetAllOrdersResponse>, next: NextFunction) => {
    try {
      await getAllOrdersService(res);
    } catch (error: any) {
      return next(new AppError(error.message || "Internal server error", 500));
    }
  }
);

export const sendStripePublishableKey = CatchAsyncError(
  async (req: Request, res: Response<SendStripePublishableKeyResponse>, next: NextFunction) => {
    try {
      if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        return next(new AppError("Stripe publishable key not configured", 500));
      }
      res.status(200).json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    } catch (error: any) {
      return next(new AppError(error.message || "Internal server error", 500));
    }
  }
);

// New Function: Check Purchase
export const checkPurchase = CatchAsyncError(
  async (req: Request, res: Response<{ success: boolean; purchased: boolean }>, next: NextFunction) => {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== "string") {
        return next(new AppError("Course ID is required", 400));
      }

      const user = await UserModel.findById(req.user?._id).select("+courses");
      if (!user) {
        return res.status(200).json({ success: true, purchased: false }); // Allow unauthenticated check
      }

      const purchased = user.courses.some((c: { courseId: string }) => c.courseId === courseId);
      res.status(200).json({ success: true, purchased });
    } catch (error: any) {
      return next(new AppError(error.message || "Internal server error", 500));
    }
  }
);

export const enrollCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body;
      const userId = req.user?._id;

      if (!userId || !courseId) {
        return next(new AppError("Missing user ID or course ID", 400));
      }

      const user = await UserModel.findById(userId).select("+courses");
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      if (user.courses.some((c: any) => String(c.courseId) === String(courseId))) {
        return res.status(400).json({
          success: false,
          message: "You have already purchased this course",
        });
      }

      user.courses.push({ courseId });
      await user.save();
      console.log(`Enrolled user ${userId} in free course ${courseId}`);

      // Invalidate Redis caches
      await client.del(`user:${userId}`);
      await client.del(`purchased_courses_${userId}`);
      await client.del(`purchase:${userId}:${courseId}`);
      console.log(`Invalidated Redis caches for user ${userId}`);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (err: any) {
      console.error("Enroll course error:", err);
      return next(new AppError(err.message, 500));
    }
  }
);