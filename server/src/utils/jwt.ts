// utils/jwt.ts (corrected & complete version)

import { Response } from "express";
import { IUser } from "../models/user.model";
import { client } from "./RedisConnect";
require("dotenv").config();

interface ItokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const ACCESS_TOKEN_EXPIRE = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "15", 10); // in minutes
const REFRESH_TOKEN_EXPIRE = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "7", 10); // in days

export const accessTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE * 60 * 1000),
  maxAge: ACCESS_TOKEN_EXPIRE * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000),
  maxAge: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

if (process.env.NODE_ENV === "production") {
  accessTokenOptions.secure = true;
  refreshTokenOptions.secure = true;
}

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
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
    await client.set(userId, JSON.stringify(user));
    console.log("User session cached in Redis");
  } catch (err) {
    console.error("Redis error:", err);
    return res.status(500).json({
      success: false,
      message: "Redis cache failure",
    });
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  return res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
