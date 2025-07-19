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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RedisConnect_1 = require("./RedisConnect");
require('dotenv').config();
// Parse .env expiration values (e.g., '70m' to milliseconds)
const parseExpiration = (expire, fallback) => {
    if (!expire)
        return parseInt(fallback, 10);
    const value = parseInt(expire, 10);
    if (expire.includes('m'))
        return value * 60 * 1000; // minutes to milliseconds
    if (expire.includes('d'))
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
    return value * 60 * 1000; // default to minutes
};
const ACCESS_TOKEN_EXPIRE_MS = parseExpiration(process.env.ACCESS_TOKEN_EXPIRE, '70m');
const REFRESH_TOKEN_EXPIRE_MS = parseExpiration(process.env.REFRESH_TOKEN_EXPIRE, '90m');
exports.accessTokenOptions = {
    expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE_MS),
    maxAge: ACCESS_TOKEN_EXPIRE_MS,
    httpOnly: true,
    sameSite: 'lax',
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_MS),
    maxAge: REFRESH_TOKEN_EXPIRE_MS,
    httpOnly: true,
    sameSite: 'lax',
};
if (process.env.NODE_ENV === 'production') {
    exports.accessTokenOptions.secure = true;
    exports.refreshTokenOptions.secure = true;
}
/**
 * Sends access and refresh tokens as cookies and JSON response.
 * Caches sanitized user object in Redis.
 */
const sendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' });
    const userId = String(user._id);
    try {
        // Sanitize user before storing in Redis
        const _a = user.toObject(), { password, resetPasswordToken, resetPasswordExpires } = _a, safeUser = __rest(_a, ["password", "resetPasswordToken", "resetPasswordExpires"]);
        yield RedisConnect_1.client.set(userId, JSON.stringify(safeUser), {
            EX: Math.floor(REFRESH_TOKEN_EXPIRE_MS / 1000), // Convert to seconds for Redis
        });
        console.log(`User session cached in Redis for user ${userId}`);
    }
    catch (err) {
        console.error('Redis cache error:', err);
        throw new Error('Failed to cache user session in Redis');
    }
    try {
        res.cookie('access_token', accessToken, exports.accessTokenOptions);
        res.cookie('refresh_token', refreshToken, exports.refreshTokenOptions);
    }
    catch (cookieErr) {
        console.error('Cookie setting error:', cookieErr);
        throw new Error('Failed to set authentication cookies');
    }
    return res.status(statusCode).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar,
        },
        accessToken,
        role: user.role,
    });
});
exports.sendToken = sendToken;
