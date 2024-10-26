"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user.controller");
const UserRoute = express_1.default.Router();
UserRoute.post('/registration', user_controller_1.registerUser);
UserRoute.post('/active-user', user_controller_1.activateUser);
exports.default = UserRoute;
