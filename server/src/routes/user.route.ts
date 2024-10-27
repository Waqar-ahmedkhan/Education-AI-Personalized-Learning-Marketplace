import express from "express";
import {
  activateUser,
  registerUser,
  UserLogin,
  Userlogout
} from "../Controllers/user.controller";

const UserRoute = express.Router();

UserRoute.post("/registration", registerUser);
UserRoute.post("/active-user", activateUser);
UserRoute.post("/login-user", UserLogin);
UserRoute.get("/logout-user", Userlogout)

export default UserRoute;
