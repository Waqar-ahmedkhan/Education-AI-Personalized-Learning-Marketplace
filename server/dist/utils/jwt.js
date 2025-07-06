"use strict";
// utils/jwt.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const RedisConnect_1 = require("./RedisConnect");
require("dotenv").config();
const ACCESS_TOKEN_EXPIRE = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "15", 10); // in minutes
const REFRESH_TOKEN_EXPIRE = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "7", 10); // in days
exports.accessTokenOptions = {
    expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE * 60 * 1000),
    maxAge: ACCESS_TOKEN_EXPIRE * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000),
    maxAge: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
if (process.env.NODE_ENV === "production") {
    exports.accessTokenOptions.secure = true;
    exports.refreshTokenOptions.secure = true;
}
/**
 * Sends access and refresh tokens as cookies and JSON response.
 * Caches sanitized user object in Redis.
 */
const sendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    if (!accessToken || !refreshToken) {
        throw new Error("Token generation failed");
    }
    const userId = String(user._id);
    try {
        // Sanitize user before storing in Redis
        const _a = user.toObject(), { password } = _a, safeUser = __rest(_a, ["password"]);
        yield RedisConnect_1.client.set(userId, JSON.stringify(safeUser), {
            EX: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60,
        });
        console.log("User session cached in Redis");
    }
    catch (err) {
        console.error("Redis error:", err);
        throw new Error("Redis cache failure");
    }
    try {
        res.cookie("access_token", accessToken, exports.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    }
    catch (cookieErr) {
        console.error("Cookie setting error:", cookieErr);
        throw new Error("Failed to set cookies");
    }
    return res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
});
exports.sendToken = sendToken;
