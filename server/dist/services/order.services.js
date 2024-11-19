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
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const Order_model_1 = require("../models/Order.model");
// create new order
exports.newOrder = (0, CatchAsyncError_1.CatchAsyncError)((data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield Order_model_1.OrderModel.create(data);
    res.status(201).json({
        succcess: true,
        order,
    });
}));
// Get All Orders
const getAllOrdersService = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield Order_model_1.OrderModel.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        orders,
    });
});
exports.getAllOrdersService = getAllOrdersService;
