import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { client } from '../utils/RedisConnect';
import UserModel from '../models/user.model';
import { CatchAsyncError } from './CatchAsyncError';
import { accessTokenOptions, refreshTokenOptions } from '../utils/jwt';

const getTokenFromRequest = (req: Request): string | null => {
  if (req.cookies?.access_token) return req.cookies.access_token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next(new AppError('Please login to access this resource', 401));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    } catch (err: any) {
      if (!res.headersSent) {
        return next(
          new AppError(
            err.name === 'TokenExpiredError'
              ? 'Access token expired. Please refresh or login again.'
              : 'Invalid access token',
            401
          )
        );
      }
      console.error('Error after headers sent:', err);
      return;
    }

    let user = await client.get(decoded.id);
    if (!user) {
      const dbUser = await UserModel.findById(decoded.id).select('name email role isVerified courses courseProgress');
      if (!dbUser) return next(new AppError('User not found', 401));
      user = JSON.stringify(dbUser);
      await client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
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
    const token = req.cookies.refresh_token;

    if (!token) return next(new AppError('Please login again', 401));

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
    } catch (err: any) {
      return next(
        new AppError(
          err.name === 'TokenExpiredError'
            ? 'Refresh token expired. Please login again.'
            : 'Invalid refresh token',
          401
        )
      );
    }

    let user = await client.get(decoded.id);
    if (!user) {
      const dbUser = await UserModel.findById(decoded.id).select('name email role isVerified courses courseProgress');
      if (!dbUser) return next(new AppError('User not found', 401));
      user = JSON.stringify(dbUser);
      await client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
    }

    const parsedUser = JSON.parse(user);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: parsedUser.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: parsedUser.role },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' }
    );

    res.cookie('access_token', newAccessToken, accessTokenOptions);
    res.cookie('refresh_token', newRefreshToken, refreshTokenOptions);

    await client.set(
      decoded.id,
      JSON.stringify({ ...parsedUser, refresh_token: newRefreshToken }),
      { EX: 7 * 24 * 60 * 60 }
    );

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
  }
);