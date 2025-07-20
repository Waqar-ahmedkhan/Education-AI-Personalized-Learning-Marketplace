import express from "express";
import {
  activateUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  UserLogin,
  UserLogout,
  getUserInformatin,
  UpdateUserInformation,
  UpdatePassword,
  UpdateProfilePicture,
  forgetPassword,
  resetPassword,
} from "../Controllers/user.controller";
import { isAuthenticated, isUser } from "../middlewares/auth";
import rateLimit from "express-rate-limit";

const UserRoute = express.Router();

// Rate limiter for forget password
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Public user routes
UserRoute.post("/user/registration", registerUser);
UserRoute.post("/user/activate", activateUser);
UserRoute.post("/user/login", UserLogin);
UserRoute.post("/user/social-auth", socialAuth);
UserRoute.post("/user/forgot-password", forgotPasswordLimiter, forgetPassword);
UserRoute.post("/user/reset-password", resetPassword);


// Protected user routes
UserRoute.get("/user/refresh", isAuthenticated, isUser, updateAccessToken);
UserRoute.get("/user/logout", isAuthenticated, isUser, UserLogout);
UserRoute.get("/user/me", isAuthenticated, isUser, getUserInformatin);
UserRoute.put(
  "/user/update-info",
  isAuthenticated,
  isUser,
  UpdateUserInformation
);
UserRoute.put(
  "/user/update-password",
  isAuthenticated,
  isUser,
  UpdatePassword
);
UserRoute.put(
  "/user/avatar-upload",
  isAuthenticated,
  isUser,
  UpdateProfilePicture
);

export default UserRoute;