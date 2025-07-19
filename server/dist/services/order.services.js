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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersService = exports.newOrder = void 0;
const Order_model_1 = require("../models/Order.model");
const AppError_1 = require("../utils/AppError");
const newOrder = (data, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_model_1.OrderModel.create(data);
        return order;
    }
    catch (error) {
        next(new AppError_1.AppError(error.message, 500));
        return undefined;
    }
});
exports.newOrder = newOrder;
const getAllOrdersService = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_model_1.OrderModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        throw new AppError_1.AppError(error.message, 500);
    }
});
exports.getAllOrdersService = getAllOrdersService;
