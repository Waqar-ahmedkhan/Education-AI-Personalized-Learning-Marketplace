import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { client } from '../utils/RedisConnect';
import UserModel from '../models/user.model';
import { CatchAsyncError } from './CatchAsyncError';
import { accessTokenOptions, refreshTokenOptions } from '../utils/jwt';

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(new AppError('Please login to access this resource', 401));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Access token expired. Please refresh or login again.', 401));
      }
      return next(new AppError('Invalid access token', 401));
    }

    let user = await client.get(decoded.id);
    if (!user) {
      const dbUser = await UserModel.findById(decoded.id).select('name email role isVerified');
      if (!dbUser) {
        return next(new AppError('User not found', 401));
      }
      user = JSON.stringify(dbUser);
      await client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 }); // 7 days
    }

    req.user = JSON.parse(user);
    next();
  }
);

export const isUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'user') {
      return next(new AppError('Unauthorized: User access only', 403));
    }
    next();
  }
);

export const isAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Unauthorized: Admin access only', 403));
    }
    next();
  }
);

export const refreshToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return next(new AppError('Please login again', 401));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Refresh token expired. Please login again.', 401));
      }
      return next(new AppError('Invalid refresh token', 401));
    }

    let user = await client.get(decoded.id);
    if (!user) {
      const dbUser = await UserModel.findById(decoded.id).select('name email role isVerified');
      if (!dbUser) {
        return next(new AppError('User not found', 401));
      }
      user = JSON.stringify(dbUser);
      await client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 }); // 7 days
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: JSON.parse(user).role }, // Include role in token
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
    );

    // Update refresh token if needed (optional, based on your refresh strategy)
    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: JSON.parse(user).role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
    );

    res.cookie('access_token', newAccessToken, accessTokenOptions);
    res.cookie('refresh_token', newRefreshToken, refreshTokenOptions);
    await client.set(decoded.id, JSON.stringify({ ...JSON.parse(user), refresh_token: newRefreshToken }), { EX: 7 * 24 * 60 * 60 });

    res.status(200).json({ success: true, accessToken: newAccessToken });
  }
);