"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const Order_controller_1 = require("../Controllers/Order.controller");
const orderRoute = express_1.default.Router();
orderRoute.post("/create-order", auth_1.isAuthenticated, Order_controller_1.createOrder);
orderRoute.post("/get-orders", auth_1.isAuthenticated, auth_1.isAdmin, Order_controller_1.getAllOrders);
exports.default = orderRoute;
