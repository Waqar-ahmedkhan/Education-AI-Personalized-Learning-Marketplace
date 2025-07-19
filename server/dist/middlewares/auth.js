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
exports.refreshToken = exports.isAdmin = exports.isUser = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const RedisConnect_1 = require("../utils/RedisConnect");
const user_model_1 = __importDefault(require("../models/user.model"));
const CatchAsyncError_1 = require("./CatchAsyncError");
const jwt_1 = require("../utils/jwt");
const getTokenFromRequest = (req) => {
    var _a, _b;
    if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token)
        return req.cookies.access_token;
    if ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};
exports.isAuthenticated = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return next(new AppError_1.AppError('Please login to access this resource', 401));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    catch (err) {
        if (!res.headersSent) {
            return next(new AppError_1.AppError(err.name === 'TokenExpiredError'
                ? 'Access token expired. Please refresh or login again.'
                : 'Invalid access token', 401));
        }
        console.error('Error after headers sent:', err);
        return;
    }
    let user = yield RedisConnect_1.client.get(decoded.id);
    if (!user) {
        const dbUser = yield user_model_1.default.findById(decoded.id).select('name email role isVerified courses courseProgress');
        if (!dbUser)
            return next(new AppError_1.AppError('User not found', 401));
        user = JSON.stringify(dbUser);
        yield RedisConnect_1.client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
    }
    req.user = JSON.parse(user);
    next();
}));
exports.isUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'user') {
        return next(new AppError_1.AppError('Unauthorized: User access only', 403));
    }
    next();
}));
exports.isAdmin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return next(new AppError_1.AppError('Unauthorized: Admin access only', 403));
    }
    next();
}));
exports.refreshToken = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.refresh_token;
    if (!token)
        return next(new AppError_1.AppError('Please login again', 401));
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        return next(new AppError_1.AppError(err.name === 'TokenExpiredError'
            ? 'Refresh token expired. Please login again.'
            : 'Invalid refresh token', 401));
    }
    let user = yield RedisConnect_1.client.get(decoded.id);
    if (!user) {
        const dbUser = yield user_model_1.default.findById(decoded.id).select('name email role isVerified courses courseProgress');
        if (!dbUser)
            return next(new AppError_1.AppError('User not found', 401));
        user = JSON.stringify(dbUser);
        yield RedisConnect_1.client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
    }
    const parsedUser = JSON.parse(user);
    const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: parsedUser.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' });
    const newRefreshToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: parsedUser.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' });
    res.cookie('access_token', newAccessToken, jwt_1.accessTokenOptions);
    res.cookie('refresh_token', newRefreshToken, jwt_1.refreshTokenOptions);
    yield RedisConnect_1.client.set(decoded.id, JSON.stringify(Object.assign(Object.assign({}, parsedUser), { refresh_token: newRefreshToken })), { EX: 7 * 24 * 60 * 60 });
    res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        user: {
            _id: parsedUser._id,
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role,
            isVerified: parsedUser.isVerified,
            avatar: parsedUser.avatar,
        },
    });
}));
