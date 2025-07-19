"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const UserRoute = express_1.default.Router();
// Rate limiter for forget password
const forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
// Public user routes
UserRoute.post("/user/registration", user_controller_1.registerUser);
UserRoute.post("/user/activate", user_controller_1.activateUser);
UserRoute.post("/user/login", user_controller_1.UserLogin);
UserRoute.post("/user/social-auth", user_controller_1.socialAuth);
UserRoute.post("/user/forgot-password", forgotPasswordLimiter, user_controller_1.forgetPassword);
UserRoute.post("/user/reset-password", user_controller_1.resetPassword);
// Protected user routes
UserRoute.get("/user/refresh", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.updateAccessToken);
UserRoute.get("/user/logout", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.UserLogout);
UserRoute.get("/user/me", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.getUserInformatin);
UserRoute.put("/user/update-info", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.UpdateUserInformation);
UserRoute.put("/user/update-password", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.UpdatePassword);
UserRoute.put("/user/avatar-upload", auth_1.isAuthenticated, auth_1.isUser, user_controller_1.UpdateProfilePicture);
exports.default = UserRoute;
