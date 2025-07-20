"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourse = exports.checkPurchase = exports.sendStripePublishableKey = exports.getAllOrders = exports.verifyPayment = exports.createCheckoutSession = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const user_model_1 = __importDefault(require("../models/user.model"));
const Course_model_1 = __importDefault(require("../models/Course.model"));
const order_services_1 = require("../services/order.services");
const uuid_1 = require("uuid");
const stripe_1 = __importDefault(require("stripe"));
const Order_model_1 = require("../models/Order.model");
const RedisConnect_1 = require("../utils/RedisConnect");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || typeof stripeSecretKey !== "string") {
    throw new Error("STRIPE_SECRET_KEY is not configured or is invalid");
}
const stripe = new stripe_1.default(stripeSecretKey);
// Existing Functions (unchanged)
exports.createCheckoutSession = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return next(new AppError_1.AppError("Course ID is required", 400));
        }
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        const course = yield Course_model_1.default.findById(courseId);
        if (!course) {
            return next(new AppError_1.AppError("Course not found", 404));
        }
        const courseExistInUser = user.courses.some((c) => c.courseId.toString() === courseId);
        if (courseExistInUser) {
            return next(new AppError_1.AppError("You have already purchased this course", 400));
        }
        const orderNumber = (0, uuid_1.v4)().slice(0, 8);
        const session = yield stripe.checkout.sessions.create({
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
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message || "Internal server error", 500));
    }
}));
exports.verifyPayment = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { session_id } = req.query;
        if (!session_id || typeof session_id !== "string") {
            return next(new AppError_1.AppError("Session ID is required", 400));
        }
        const session = yield stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== "paid") {
            return next(new AppError_1.AppError("Payment not completed", 400));
        }
        const { userId, courseId } = session.metadata;
        const user = yield user_model_1.default.findById(userId).select("+courses");
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        if (!user.courses.some((c) => c.courseId === courseId)) {
            user.courses.push({ courseId });
            yield user.save();
        }
        const paymentInfo = {
            id: session.id,
            status: session.payment_status,
            amount_paid: session.amount_total,
            currency: session.currency,
        };
        const order = new Order_model_1.OrderModel({
            userId,
            courseId,
            payment_info: paymentInfo,
        });
        yield order.save();
        res.status(200).json({ success: true, user: user.toJSON() });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message || "Internal server error", 500));
    }
}));
exports.getAllOrders = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, order_services_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message || "Internal server error", 500));
    }
}));
exports.sendStripePublishableKey = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.STRIPE_PUBLISHABLE_KEY) {
            return next(new AppError_1.AppError("Stripe publishable key not configured", 500));
        }
        res.status(200).json({
            success: true,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message || "Internal server error", 500));
    }
}));
// New Function: Check Purchase
exports.checkPurchase = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.query;
        if (!courseId || typeof courseId !== "string") {
            return next(new AppError_1.AppError("Course ID is required", 400));
        }
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("+courses");
        if (!user) {
            return res.status(200).json({ success: true, purchased: false }); // Allow unauthenticated check
        }
        const purchased = user.courses.some((c) => c.courseId === courseId);
        res.status(200).json({ success: true, purchased });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message || "Internal server error", 500));
    }
}));
exports.enrollCourse = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId || !courseId) {
            return next(new AppError_1.AppError("Missing user ID or course ID", 400));
        }
        const user = yield user_model_1.default.findById(userId).select("+courses");
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        if (user.courses.some((c) => String(c.courseId) === String(courseId))) {
            return res.status(400).json({
                success: false,
                message: "You have already purchased this course",
            });
        }
        user.courses.push({ courseId });
        yield user.save();
        console.log(`Enrolled user ${userId} in free course ${courseId}`);
        // Invalidate Redis caches
        yield RedisConnect_1.client.del(`user:${userId}`);
        yield RedisConnect_1.client.del(`purchased_courses_${userId}`);
        yield RedisConnect_1.client.del(`purchase:${userId}:${courseId}`);
        console.log(`Invalidated Redis caches for user ${userId}`);
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (err) {
        console.error("Enroll course error:", err);
        return next(new AppError_1.AppError(err.message, 500));
    }
}));
