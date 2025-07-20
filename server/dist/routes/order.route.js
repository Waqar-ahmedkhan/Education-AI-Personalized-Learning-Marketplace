"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const Order_controller_1 = require("../Controllers/Order.controller");
const StripeWebhook_controller_1 = require("../Controllers/StripeWebhook.controller");
const orderRoute = express_1.default.Router();
// Stripe Payment Routes
orderRoute.post("/create-checkout-session", auth_1.isAuthenticated, Order_controller_1.createCheckoutSession);
orderRoute.get("/verify-payment", auth_1.isAuthenticated, Order_controller_1.verifyPayment);
orderRoute.get("/stripe-publishable-key", Order_controller_1.sendStripePublishableKey);
// Stripe Webhook (MUST be raw)
orderRoute.post("/webhook", express_1.default.raw({ type: "application/json" }), StripeWebhook_controller_1.stripeWebhook);
// Admin: Get all orders
orderRoute.get("/get-orders", auth_1.isAuthenticated, auth_1.isAdmin, Order_controller_1.getAllOrders);
// Check Purchase
orderRoute.get("/check-purchase", auth_1.isAuthenticated, Order_controller_1.checkPurchase);
// Enroll in Free Course
orderRoute.post("/enroll-course", auth_1.isAuthenticated, Order_controller_1.enrollCourse);
exports.default = orderRoute;
