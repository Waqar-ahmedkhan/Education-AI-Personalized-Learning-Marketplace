"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const notification_controller_1 = require("../Controllers/notification.controller");
const notificationRoute = express_1.default.Router();
notificationRoute.get("/get-all-notifications", auth_1.isAuthenticated, auth_1.isAdmin, notification_controller_1.getNotification);
notificationRoute.put("/update-notification/:id", auth_1.isAuthenticated, auth_1.isAdmin, notification_controller_1.updateNotification);
exports.default = notificationRoute;
