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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const RedisConnect_1 = require("./RedisConnect"); // Assuming Redis client is configured in a separate file
require("dotenv").config();
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "90000", // 15 minutes
10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "86400", // 1 day
10);
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // Use seconds for consistency
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
const sendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    // Ensure tokens are generated
    if (!accessToken || !refreshToken) {
        return res.status(500).json({
            success: false,
            message: "Token generation failed",
        });
    }
    // Ensure _id is string before passing to Redis
    const userId = String(user.id);
    // Store user data in Redis
    try {
        yield RedisConnect_1.client.set(userId, JSON.stringify(user));
        console.log("User data saved in Redis");
    }
    catch (err) {
        console.error("Error saving data in Redis:", err);
        return res.status(500).json({
            success: false,
            message: "Error saving user data in cache",
        });
    }
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "9000", // 15 minutes
    10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "86400", // 1 day
    10);
    const accessTokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // Use seconds for consistency
        maxAge: accessTokenExpire * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    };
    const refreshTokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
        maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    };
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
    }
    // Set cookies for access and refresh tokens
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    // Return access token in the response
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
});
exports.sendToken = sendToken;
