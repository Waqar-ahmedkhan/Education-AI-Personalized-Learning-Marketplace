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
exports.stripeWebhook = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const user_model_1 = __importDefault(require("../models/user.model"));
const Course_model_1 = __importDefault(require("../models/Course.model"));
const Notification_model_1 = require("../models/Notification.model");
const RedisConnect_1 = require("../utils/RedisConnect");
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const order_services_1 = require("../services/order.services");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.stripeWebhook = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        return next(new AppError_1.AppError('Webhook secret not configured', 500));
    }
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, courseId, orderNumber } = session.metadata;
            const user = yield user_model_1.default.findById(userId);
            const course = yield Course_model_1.default.findById(courseId);
            if (!user || !course) {
                return next(new AppError_1.AppError('User or course not found', 404));
            }
            const courseExistInUser = user.courses.some((c) => c.courseId.toString() === courseId);
            if (!courseExistInUser) {
                user.courses.push({ courseId });
                yield RedisConnect_1.client.set(userId, JSON.stringify(user));
                yield user.save();
                course.purchased = (course.purchased || 0) + 1;
                yield course.save();
                const data = {
                    userId,
                    courseId,
                    payment_info: {
                        id: session.payment_intent,
                        status: session.payment_status,
                    },
                };
                const order = yield (0, order_services_1.newOrder)(data, res, next);
                if (!order) {
                    return next(new AppError_1.AppError('Order creation failed', 500));
                }
                const mailData = {
                    order: {
                        id: orderNumber,
                        name: course.name,
                        price: course.price,
                        date: new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                    },
                };
                const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });
                yield (0, Sendemail_1.default)({
                    email: user.email,
                    subject: 'Order Confirmation',
                    template: 'order-confirmation.ejs',
                    data: mailData,
                });
                yield Notification_model_1.NotificaModel.create({
                    user: user._id,
                    title: 'New Order',
                    message: `You have a new order from ${course.name}`,
                });
            }
        }
        res.json({ received: true });
    }
    catch (error) {
        return next(new AppError_1.AppError(`Webhook Error: ${error.message}`, 400));
    }
}));
