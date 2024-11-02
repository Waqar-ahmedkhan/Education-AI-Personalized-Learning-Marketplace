import express from "express";
import {
  activateUser,
  getUserInformatin,
  registerUser,
  socialAuth,
  updateAccessToken,
  UpdatePassword,
  UpdateProfilePicture,
  UpdateUserInformation,
  UserLogin,
  UserLogout,
} from "../Controllers/user.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";

const UserRoute = express.Router();

UserRoute.post("/registration", registerUser);
UserRoute.post("/active-user", activateUser);
UserRoute.post("/login-user", UserLogin);
UserRoute.get("/logout-user", isAuthenticated, UserLogout)
UserRoute.get("/refresh", updateAccessToken)
UserRoute.get("/me", isAuthenticated, getUserInformatin)
UserRoute.post("/soical-auth",  socialAuth);
UserRoute.put("/update-user-info",isAuthenticated, UpdateUserInformation);

// there are those routes are which are not tested like for last 4 5 days
UserRoute.put("/update-password",isAuthenticated, UpdatePassword);// not tested
UserRoute.put("/avatar-upload",isAuthenticated, UpdateProfilePicture);// not tested

export default UserRoute;
