"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const AdminRoute = express_1.default.Router();
// Public admin route (initial setup)
AdminRoute.post('/admin/setup-initial-admin', user_controller_1.createInitialAdmin);
// Protected admin routes
AdminRoute.post('/admin/login', user_controller_1.adminLogin); // Reuse UserLogin with admin check
AdminRoute.get('/admin/users', auth_1.isAuthenticated, auth_1.isAdmin, user_controller_1.getallUsers);
AdminRoute.put('/admin/update-user-role', auth_1.isAuthenticated, auth_1.isAdmin, user_controller_1.updateUserRoles);
AdminRoute.delete('/admin/user-delete/:id', auth_1.isAuthenticated, auth_1.isAdmin, user_controller_1.deleteUser);
AdminRoute.post('/admin/create-admin', auth_1.isAuthenticated, auth_1.isAdmin, user_controller_1.createAdmin);
AdminRoute.get('/admin/me', auth_1.isAuthenticated, auth_1.isAdmin, user_controller_1.getAdminInfo);
exports.default = AdminRoute;
