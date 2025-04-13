import express from "express";
import {
  activateUser,
  createAdmin,
  createInitialAdmin,
  deleteUser,
  getallUsers,
  getUserInformatin,
  registerUser,
  socialAuth,
  updateAccessToken,
  UpdatePassword,
  UpdateProfilePicture,
  UpdateUserInformation,
  updateUserRoles,
  UserLogin,
  UserLogout,
} from "../Controllers/user.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";

const UserRoute = express.Router();

UserRoute.post("/registration", registerUser);
UserRoute.post("/active-user", activateUser);
UserRoute.post("/login-user", UserLogin);
UserRoute.get("/logout-user", isAuthenticated, UserLogout);
UserRoute.get("/refresh", updateAccessToken);
UserRoute.get("/me", isAuthenticated, getUserInformatin);
UserRoute.post("/soical-auth", socialAuth);
UserRoute.put("/update-user-info", isAuthenticated, UpdateUserInformation);

UserRoute.put("/update-password", isAuthenticated, UpdatePassword);
UserRoute.put("/avatar-upload", isAuthenticated, UpdateProfilePicture);

UserRoute.get(
  "/get-users",
  isAuthenticated,
  authorizedRoles("admin"),
  getallUsers
); 
UserRoute.put(
  "/update-user-route",
  isAuthenticated,
  authorizedRoles("admin"),
  updateUserRoles
);

UserRoute.delete(
  "/user-delete/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteUser
);

UserRoute.post(
  "/create-admin",
  isAuthenticated,
  authorizedRoles("admin"),
  createAdmin
);

// Route for creating the initial admin user (requires setup key)
UserRoute.post("/setup-initial-admin", createInitialAdmin);

export default UserRoute;
