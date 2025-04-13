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
exports.authorizedRoles = exports.isAuthenticated = void 0;
const CatchAsyncError_1 = require("./CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RedisConnect_1 = require("../utils/RedisConnect");
exports.isAuthenticated = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const access_token = req.cookies.access_token;
        if (!access_token) {
            return next(new AppError_1.AppError("Please login to access this resource", 400));
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json({
                    success: false,
                    message: "Token expired. Please login again.",
                });
            }
            return res
                .status(401)
                .json({ success: false, message: "Invalid token." });
        }
        const user = yield RedisConnect_1.client.get(decoded.id);
        if (!user) {
            return next(new AppError_1.AppError("User not found", 400));
        }
        req.user = JSON.parse(user);
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
}));
const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        var _a, _b;
        if (!roles.includes(((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || "")) {
            return next(new AppError_1.AppError(`Role ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role} is not allowed to access this `, 400));
        }
        next();
    };
};
exports.authorizedRoles = authorizedRoles;
