import { Response } from "express";
import { IUserInput } from "../models/user.model";
import { client } from "./RedisConnect"; // Assuming Redis client is configured in a separate file
require("dotenv").config();

interface ItokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const sendToken = async (
  user: IUserInput,
  statusCode: number,
  res: Response
) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Ensure _id is string before passing to Redis
  const userId = String(user._id);

  // Store user data in Redis
  try {
    await client.set(userId, JSON.stringify(user), {
      EX: parseInt(process.env.REDIS_EXPIRE_TIME || "3600", 10), // Expiry time in seconds
    });
    console.log("User data saved in Redis");
  } catch (err) {
    console.error("Error saving data in Redis:", err);
  }

  const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "300",
    10
  );
  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "300",
    10
  );

  const accessTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  // Set cookies for access and refresh tokens
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
