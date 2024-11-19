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
exports.updateNotification = exports.getNotification = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const Notification_model_1 = require("../models/Notification.model");
const node_cron_1 = __importDefault(require("node-cron"));
exports.getNotification = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield Notification_model_1.NotificaModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notification,
        });
    }
    catch (err) {
        next(new AppError_1.AppError("error in getNotification", 400));
    }
}));
/// update notification status
exports.updateNotification = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield Notification_model_1.NotificaModel.findById(req.params.id);
        if (!notification) {
            next(new AppError_1.AppError("no notification found", 404));
        }
        else {
            notification.status
                ? (notification.status = "read")
                : notification.status;
            yield notification.save();
        }
        const notificaitons = yield Notification_model_1.NotificaModel.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            message: "working update notificaiton",
            notificaitons,
        });
    }
    catch (err) {
        next(new AppError_1.AppError("error in update notification", 400));
    }
}));
node_cron_1.default.schedule("0 0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate the date 3 days ago
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        // Delete notifications with 'read' status that were created more than 3 days ago
        const result = yield Notification_model_1.NotificaModel.deleteMany({
            status: "read",
            createdAt: { $lt: threeDaysAgo }, // Corrected operator here
        });
        console.log(`Cron Job: Deleted ${result.deletedCount} old notifications`);
    }
    catch (error) {
        console.error("Error running cron job for cleaning notifications:", error);
    }
}));
