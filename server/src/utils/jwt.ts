import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { client } from './RedisConnect';
import { IUser } from '../models/user.model';
require('dotenv').config();

interface ItokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure?: boolean;
}

// Parse .env expiration values (e.g., '70m' to milliseconds)
const parseExpiration = (expire: string | undefined, fallback: string): number => {
  if (!expire) return parseInt(fallback, 10);
  const value = parseInt(expire, 10);
  if (expire.includes('m')) return value * 60 * 1000; // minutes to milliseconds
  if (expire.includes('d')) return value * 24 * 60 * 60 * 1000; // days to milliseconds
  return value * 60 * 1000; // default to minutes
};

const ACCESS_TOKEN_EXPIRE_MS = parseExpiration(process.env.ACCESS_TOKEN_EXPIRE, '70m');
const REFRESH_TOKEN_EXPIRE_MS = parseExpiration(process.env.REFRESH_TOKEN_EXPIRE, '90m');

export const accessTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE_MS),
  maxAge: ACCESS_TOKEN_EXPIRE_MS,
  httpOnly: true,
  sameSite: 'lax',
};

export const refreshTokenOptions: ItokenOptions = {
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_MS),
  maxAge: REFRESH_TOKEN_EXPIRE_MS,
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') {
  accessTokenOptions.secure = true;
  refreshTokenOptions.secure = true;
}

/**
 * Sends access and refresh tokens as cookies and JSON response.
 * Caches sanitized user object in Redis.
 */
export const sendToken = async (user: IUser, statusCode: number, res: Response) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' }
  );

  const userId = String(user._id);

  try {
    // Sanitize user before storing in Redis
    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user.toObject();
    await client.set(userId, JSON.stringify(safeUser), {
      EX: Math.floor(REFRESH_TOKEN_EXPIRE_MS / 1000), // Convert to seconds for Redis
    });
    console.log(`User session cached in Redis for user ${userId}`);
  } catch (err) {
    console.error('Redis cache error:', err);
    throw new Error('Failed to cache user session in Redis');
  }

  try {
    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);
  } catch (cookieErr) {
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
};