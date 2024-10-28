"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const UserRoute = express_1.default.Router();
UserRoute.post("/registration", user_controller_1.registerUser);
UserRoute.post("/active-user", user_controller_1.activateUser);
UserRoute.post("/login-user", user_controller_1.UserLogin);
UserRoute.get("/logout-user", auth_1.isAuthenticated, user_controller_1.UserLogout);
UserRoute.get("/refresh", user_controller_1.updateAccessToken);
UserRoute.get("/me", auth_1.isAuthenticated, user_controller_1.getUserInformatin);
UserRoute.post("/soical-auth", user_controller_1.socialAuth);
exports.default = UserRoute;
