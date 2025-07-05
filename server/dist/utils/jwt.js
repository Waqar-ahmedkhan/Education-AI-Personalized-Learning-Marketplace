"use strict";
// utils/jwt.ts (corrected & complete version)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const sendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    if (!accessToken || !refreshToken) {
        return res.status(500).json({
            success: false,
            message: "Token generation failed",
        });
    }
    const userId = String(user._id);
    try {
        yield RedisConnect_1.client.set(userId, JSON.stringify(user));
        console.log("User session cached in Redis");
    }
    catch (err) {
        console.error("Redis error:", err);
        return res.status(500).json({
            success: false,
            message: "Redis cache failure",
        });
    }
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    return res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
});
exports.sendToken = sendToken;
