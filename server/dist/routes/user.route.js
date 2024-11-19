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
// there are those routes are which are not tested like for last 4 5 days
UserRoute.put("/update-password", auth_1.isAuthenticated, user_controller_1.UpdatePassword); // not tested
UserRoute.put("/avatar-upload", auth_1.isAuthenticated, user_controller_1.UpdateProfilePicture); // not tested
UserRoute.get("/get-users", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.getallUsers); //not tested
UserRoute.put("/update-user-route", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.updateUserRoles); //not tested
UserRoute.delete("/user-delete", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.deleteUser);
exports.default = UserRoute;
