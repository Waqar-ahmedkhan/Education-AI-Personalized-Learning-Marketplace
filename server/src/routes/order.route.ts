
import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth";
import {
  createCheckoutSession,
  getAllOrders,
  sendStripePublishableKey,
  verifyPayment,
  checkPurchase,
  enrollCourse, // Import the enrollCourse function
} from "../Controllers/Order.controller";
import { stripeWebhook } from "../Controllers/StripeWebhook.controller";

const orderRoute = express.Router();

// Stripe Payment Routes
orderRoute.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

orderRoute.get("/verify-payment", isAuthenticated, verifyPayment);

orderRoute.get("/stripe-publishable-key", sendStripePublishableKey);

// Stripe Webhook (MUST be raw)
orderRoute.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Admin: Get all orders
orderRoute.get("/get-orders", isAuthenticated, isAdmin, getAllOrders);

// Check Purchase
orderRoute.get("/check-purchase", isAuthenticated, checkPurchase);

// Enroll in Free Course
orderRoute.post("/enroll-course", isAuthenticated, enrollCourse);

export default orderRoute;
