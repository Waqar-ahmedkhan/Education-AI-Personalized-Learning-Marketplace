import { application, NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./CatchAsyncError";
import { AppError } from "../utils/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "../utils/RedisConnect";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = req.cookies.access_token;

      if (!access_token) {
        return next(new AppError("Please login to access this resource", 400));
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          access_token,
          process.env.ACCESS_TOKEN_SECRET as string
        ) as JwtPayload;
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({
              success: false,
              message: "Token expired. Please login again.",
            });
        }
        return res
          .status(401)
          .json({ success: false, message: "Invalid token." });
      }

      const user = await client.get(decoded.id);

      if (!user) {
        return next(new AppError("User not found", 400));
      }

      req.user = JSON.parse(user);
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
);

export const authorizedRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new AppError(
          `Role ${req.user?.role} is not allowed to access this `,
          400
        )
      );
    }
    next();
  };
};
