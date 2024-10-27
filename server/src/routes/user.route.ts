import express from "express";
import {
  activateUser,
  registerUser,
  updateAccessToken,
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

export default UserRoute;
