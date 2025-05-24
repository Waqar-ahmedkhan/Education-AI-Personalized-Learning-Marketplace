import { Response } from "express";
import { IUser } from "../models/user.model";
import { client } from "./RedisConnect"; // Assuming Redis client is configured in a separate file
require("dotenv").config();

interface ItokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}


const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "90000", // 15 minutes
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "86400", // 1 day
  10
);

export const accessTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // Use seconds for consistency
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 *  60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};


export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
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
    await client.set(userId, JSON.stringify(user));
    console.log("User data saved in Redis");
  } catch (err) {
    console.error("Error saving data in Redis:", err);
    return res.status(500).json({
      success: false,
      message: "Error saving user data in cache",
    });
  }

  const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "9000", // 15 minutes
    10
  );
  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "86400", // 1 day
    10
  );

  const accessTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // Use seconds for consistency
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 *  60 * 1000,
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
};
