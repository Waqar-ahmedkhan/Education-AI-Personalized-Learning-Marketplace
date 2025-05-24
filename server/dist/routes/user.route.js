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
UserRoute.put("/update-user-info", auth_1.isAuthenticated, user_controller_1.UpdateUserInformation);
UserRoute.put("/update-password", auth_1.isAuthenticated, user_controller_1.UpdatePassword);
UserRoute.put("/avatar-upload", auth_1.isAuthenticated, user_controller_1.UpdateProfilePicture);
UserRoute.get("/get-users", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.getallUsers);
UserRoute.put("/update-user-route", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.updateUserRoles);
UserRoute.delete("/user-delete/:id", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.deleteUser);
UserRoute.post("/create-admin", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.createAdmin);
// Route for creating the initial admin user (requires setup key)
UserRoute.post("/setup-initial-admin", user_controller_1.createInitialAdmin);
exports.default = UserRoute;
